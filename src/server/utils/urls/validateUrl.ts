import { TRPCError } from "@trpc/server";
import { isValid as isValidIpAddress } from "ipaddr.js";
import { toASCII } from "punycode";

export const ERROR_URL_EMPTY = "URL is empty";
export const ERROR_URL_MALFORMED = "Malformed URL";
export const ERROR_INVALID_SCHEME = "Invalid URL scheme";
export const ERROR_CONTAINS_CREDENTIALS = "URL contains username or password";
export const ERROR_NO_HOSTNAME = "URL contains no hostname";
export const ERROR_INVALID_HOSTNAME = "URL contains invalid hostname";
export const ERROR_CONTAINS_PORT = "URL contains port";
export const ERROR_BANNED_HOSTNAME = "URL contains banned hostname";
export const ERROR_CONTAINS_IP = "URL contains IP address";

export const DEFAULTS = {
  allowedSchemes: ["https"],
  bannedHosts: new Set<string>([]),
};

/**
 * Validates and normalizes a URL string for song resource creation.
 *
 * Enforces security constraints:
 * - Only https protocol allowed
 * - No embedded credentials
 * - No IP addresses (SSRF protection)
 * - No explicit ports
 * - Hostname must be valid and not banned
 *
 * Performs normalization:
 * - Trims whitespace
 * - Converts hostname to lowercase ASCII (Punycode)
 * - Removes trailing dots from hostname
 * - Collapses consecutive slashes in pathname
 *
 * @param input - The URL string to validate
 * @returns The normalized URL string
 * @throws {TRPCError} With BAD_REQUEST code and specific error message for validation failures
 */
export const validateUrl = (input: string): string => {
  if (!input) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_URL_EMPTY,
    });
  }

  const trimmedInput = input.trim();

  if (!trimmedInput) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_URL_EMPTY,
    });
  }

  let url: URL;

  try {
    url = new URL(trimmedInput);
  } catch (error) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_URL_MALFORMED,
      cause: error,
    });
  }

  const scheme = url.protocol.replace(":", "");

  if (!DEFAULTS.allowedSchemes.includes(scheme)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_INVALID_SCHEME,
      cause: new Error(`Invalid URL scheme: ${scheme}`),
    });
  }

  if (url.username || url.password) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_CONTAINS_CREDENTIALS,
      cause: new Error(`URL contains username or password`),
    });
  }

  if (!url.hostname) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_NO_HOSTNAME,
      cause: new Error(`URL contains no hostname: ${url.toString()}`),
    });
  }

  const punyHost = toASCII(url.hostname.replace(/\.$/, "")).toLowerCase();

  if (!punyHost) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_INVALID_HOSTNAME,
      cause: new Error(`URL contains invalid hostname`),
    });
  }

  url.hostname = punyHost;

  if (url.port && !(url.protocol === "https:" && url.port === "443")) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_CONTAINS_PORT,
      cause: new Error(`URL contains port`),
    });
  }

  if (DEFAULTS.bannedHosts.has(url.hostname)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_BANNED_HOSTNAME,
      cause: new Error(`URL contains banned hostname`),
    });
  }

  if (isValidIpAddress(url.hostname)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_CONTAINS_IP,
      cause: new Error(`URL contains IP address`),
    });
  }

  // Collapse consecutive slashes in the path for consistent formatting
  url.pathname = url.pathname.replace(/\/{2,}/g, "/");

  return url.toString();
};
