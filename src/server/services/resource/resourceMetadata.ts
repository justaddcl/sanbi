import {
  isValid as isValidIpAddress,
  parse as parseIpAddress,
} from "ipaddr.js";
import { lookup } from "node:dns/promises";
import { request as httpsRequest } from "node:https";
import { type LookupFunction } from "node:net";

import { type ResourceStatus } from "@lib/constants";
import { type Resource } from "@lib/types";
import {
  extractHtmlPageMetadata,
  resolveMetadataUrl,
  sanitizeNullableMetadataText,
} from "@server/utils/htmlMetadata";
import { validateUrl } from "@server/utils/urls/validateUrl";

const MAX_REDIRECTS = 5;
const FETCH_TIMEOUT_MS = 5_000;
const MAX_HTML_BYTES = 2 * 1024 * 1024;

export type ResourceMetadataStatus = Extract<
  ResourceStatus,
  "ready" | "failed"
>;

export type ResourcePreviewMetadata = {
  normalizedUrl: string;
  status: ResourceMetadataStatus;
  title: string | null;
  description: string | null;
  faviconUrl: string | null;
  imageUrl: string | null;
  lastFetchedAt: Date;
};

export type ResourceMetadataWriteValues = Pick<
  Resource,
  "status" | "metaTitle" | "metaDescription" | "faviconUrl" | "imageUrl"
> & {
  lastFetchedAt: Date;
};

export type ResourceMetadataHttpResponse = {
  status: number;
  ok: boolean;
  headers: {
    get: (name: string) => string | null;
  };
  text: () => Promise<string>;
};

type RequestResourceMetadataUrl = (
  url: string,
  options: {
    lookupHostname: typeof lookup;
    timeoutMs: number;
    maxHtmlBytes: number;
  },
) => Promise<ResourceMetadataHttpResponse>;

type FetchResourceMetadataOptions = {
  requestUrl?: RequestResourceMetadataUrl;
  lookupHostname?: typeof lookup;
  timeoutMs?: number;
  maxHtmlBytes?: number;
};

/** Blocks obvious local hostnames before DNS resolution. */
const isBlockedHostname = (hostname: string) => {
  const normalizedHostname = hostname.toLowerCase().replace(/\.$/, "");

  return (
    normalizedHostname === "localhost" ||
    normalizedHostname.endsWith(".localhost")
  );
};

/** Allows only public unicast IPs so metadata fetches cannot target private networks. */
export const isBlockedResourceMetadataIpAddress = (address: string) => {
  if (!isValidIpAddress(address)) {
    return true;
  }

  return parseIpAddress(address).range() !== "unicast";
};

/** Resolves a hostname and rejects any answer that is local, private, or reserved. */
const findPublicAddressForHostname = async (
  url: URL,
  lookupHostname: typeof lookup,
) => {
  if (isBlockedHostname(url.hostname)) {
    throw new Error("URL hostname is not public");
  }

  const addresses = await lookupHostname(url.hostname, {
    all: true,
  });

  if (addresses.length === 0) {
    throw new Error("URL hostname could not be resolved");
  }

  if (
    addresses.some(({ address }) => isBlockedResourceMetadataIpAddress(address))
  ) {
    throw new Error("URL resolves to a private or reserved address");
  }

  return addresses[0]!;
};

/** Pins the HTTPS request to the already-validated DNS answer. */
export const createPinnedAddressLookup = (publicAddress: {
  address: string;
  family: number;
}): LookupFunction => {
  return (_hostname, options, callback) => {
    if (options?.all) {
      callback(null, [
        {
          address: publicAddress.address,
          family: publicAddress.family,
        },
      ]);
      return;
    }

    callback(null, publicAddress.address, publicAddress.family);
  };
};

/** Fetches one HTTPS URL after SSRF checks, timeout handling, and HTML byte capping. */
const requestResourceMetadataUrl: RequestResourceMetadataUrl = async (
  rawUrl,
  { lookupHostname, timeoutMs, maxHtmlBytes },
) =>
  new Promise((resolve, reject) => {
    const url = new URL(rawUrl);

    findPublicAddressForHostname(url, lookupHostname)
      .then((publicAddress) => {
        const request = httpsRequest(
          url,
          {
            method: "GET",
            timeout: timeoutMs,
            headers: {
              accept: "text/html,application/xhtml+xml",
              "user-agent": "SanbiResourcePreview/1.0",
            },
            lookup: createPinnedAddressLookup(publicAddress),
            servername: url.hostname,
          },
          (response) => {
            const chunks: Uint8Array[] = [];
            let totalBytes = 0;
            let isSettled = false;

            const createResponse = (): ResourceMetadataHttpResponse => ({
              status: response.statusCode ?? 0,
              ok:
                (response.statusCode ?? 0) >= 200 &&
                (response.statusCode ?? 0) < 300,
              headers: {
                get: (name) => {
                  const header = response.headers[name.toLowerCase()];

                  if (Array.isArray(header)) {
                    return header.join(", ");
                  }

                  return header ?? null;
                },
              },
              text: async () => Buffer.concat(chunks).toString("utf8"),
            });

            // Resolve with partial HTML when capped; most metadata lives in the head.
            const resolveBufferedResponse = () => {
              if (isSettled) {
                return;
              }

              isSettled = true;
              resolve(createResponse());
            };

            const rejectBufferedResponse = (error: Error) => {
              if (isSettled) {
                return;
              }

              isSettled = true;
              reject(error);
            };

            response.on("data", (chunk: Buffer) => {
              const remainingBytes = maxHtmlBytes - totalBytes;
              totalBytes += chunk.byteLength;

              if (totalBytes > maxHtmlBytes) {
                if (remainingBytes > 0) {
                  chunks.push(chunk.subarray(0, remainingBytes));
                }

                resolveBufferedResponse();
                request.destroy();
                return;
              }

              chunks.push(chunk);
            });

            response.on("end", () => {
              resolveBufferedResponse();
            });
            response.on("error", rejectBufferedResponse);
          },
        );

        request.on("timeout", () => {
          request.destroy(new Error("Resource metadata request timed out"));
        });
        request.on("error", reject);
        request.end();
      })
      .catch(reject);
  });

/** Follows validated redirects and returns the final HTML body. */
const fetchHtmlWithRedirects = async (
  url: string,
  options: Required<
    Pick<
      FetchResourceMetadataOptions,
      "requestUrl" | "lookupHostname" | "timeoutMs" | "maxHtmlBytes"
    >
  >,
) => {
  let currentUrl = url;

  for (
    let redirectCount = 0;
    redirectCount <= MAX_REDIRECTS;
    redirectCount += 1
  ) {
    const response = await options.requestUrl(currentUrl, {
      lookupHostname: options.lookupHostname,
      timeoutMs: options.timeoutMs,
      maxHtmlBytes: options.maxHtmlBytes,
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");

      if (!location) {
        throw new Error("Redirect response did not include a Location header");
      }

      currentUrl = validateUrl(new URL(location, currentUrl).toString());
      continue;
    }

    if (!response.ok) {
      throw new Error("Resource metadata request failed");
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.toLowerCase().includes("text/html")) {
      throw new Error("Resource metadata response was not HTML");
    }

    return {
      finalUrl: currentUrl,
      html: await response.text(),
    };
  }

  throw new Error("Resource metadata request redirected too many times");
};

/** Returns preview metadata for the UI, falling back to a failed status instead of throwing. */
export const fetchResourcePreviewMetadata = async (
  rawUrl: string,
  options: FetchResourceMetadataOptions = {},
): Promise<ResourcePreviewMetadata> => {
  const normalizedUrl = validateUrl(rawUrl);
  const now = new Date();
  const fetchOptions = {
    requestUrl: options.requestUrl ?? requestResourceMetadataUrl,
    lookupHostname: options.lookupHostname ?? lookup,
    timeoutMs: options.timeoutMs ?? FETCH_TIMEOUT_MS,
    maxHtmlBytes: options.maxHtmlBytes ?? MAX_HTML_BYTES,
  };

  try {
    const { finalUrl, html } = await fetchHtmlWithRedirects(
      normalizedUrl,
      fetchOptions,
    );
    const metadata = extractHtmlPageMetadata(html, finalUrl);

    return {
      normalizedUrl: finalUrl,
      status: "ready",
      title: metadata.title,
      description: metadata.description,
      faviconUrl: metadata.faviconUrl,
      imageUrl: metadata.imageUrl,
      lastFetchedAt: now,
    };
  } catch {
    return {
      normalizedUrl,
      status: "failed",
      title: null,
      description: null,
      faviconUrl: null,
      imageUrl: null,
      lastFetchedAt: now,
    };
  }
};

/** Converts preview metadata into the exact resource columns written to the database. */
export const toResourceMetadataWriteValues = (
  previewMetadata: ResourcePreviewMetadata,
): ResourceMetadataWriteValues => ({
  status: previewMetadata.status,
  metaTitle: sanitizeNullableMetadataText(previewMetadata.title, 300),
  metaDescription: sanitizeNullableMetadataText(
    previewMetadata.description,
    500,
  ),
  faviconUrl: resolveMetadataUrl(
    previewMetadata.faviconUrl,
    previewMetadata.normalizedUrl,
  ),
  imageUrl: resolveMetadataUrl(
    previewMetadata.imageUrl,
    previewMetadata.normalizedUrl,
  ),
  lastFetchedAt: previewMetadata.lastFetchedAt,
});

/** Fetches server-controlled metadata for values that will be persisted. */
export const resolveResourceMetadataForUrl = async (rawUrl: string) => {
  const normalizedUrl = validateUrl(rawUrl);
  const fetchedMetadata = await fetchResourcePreviewMetadata(normalizedUrl);

  return {
    normalizedUrl: fetchedMetadata.normalizedUrl,
    metadataValues: toResourceMetadataWriteValues(fetchedMetadata),
  };
};
