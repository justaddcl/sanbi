import { decode } from "he";
import DOMPurify from "isomorphic-dompurify";

import { validateUrl } from "@server/utils/urls/validateUrl";

export type HtmlPageMetadata = {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  faviconUrl: string | null;
};

const truncate = (value: string, maxLength: number) =>
  value.length > maxLength ? value.slice(0, maxLength) : value;

export const decodeHtmlEntities = (value: string) => decode(value);

export const sanitizeNullableMetadataText = (
  value: string | null | undefined,
  maxLength: number,
) => {
  if (!value) {
    return null;
  }

  const normalizedWhitespace = decodeHtmlEntities(value)
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedWhitespace) {
    return null;
  }

  const sanitized = decodeHtmlEntities(
    DOMPurify.sanitize(normalizedWhitespace, {
      ALLOWED_ATTR: [],
      ALLOWED_TAGS: [],
    }),
  ).trim();

  return sanitized ? truncate(sanitized, maxLength) : null;
};

export const getHtmlTagAttribute = (tag: string, attributeName: string) => {
  const attributePattern = new RegExp(
    `\\s${attributeName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i",
  );
  const match = attributePattern.exec(tag);
  const value = match?.[1] ?? match?.[2] ?? match?.[3] ?? null;

  return value === null ? null : decode(value, { isAttributeValue: true });
};

export const getMetaContent = (html: string, names: string[]) => {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const lowerNames = names.map((name) => name.toLowerCase());

  for (const lowerName of lowerNames) {
    for (const tag of metaTags) {
      const property = getHtmlTagAttribute(tag, "property")?.toLowerCase();
      const name = getHtmlTagAttribute(tag, "name")?.toLowerCase();

      if (property === lowerName || name === lowerName) {
        return getHtmlTagAttribute(tag, "content");
      }
    }
  }

  return null;
};

export const getTitleTag = (html: string) => {
  const match = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html);

  return match?.[1] ? decodeHtmlEntities(match[1]) : null;
};

export const getLinkHref = (html: string, relMatchers: string[]) => {
  const linkTags = html.match(/<link\b[^>]*>/gi) ?? [];

  for (const tag of linkTags) {
    const rel = getHtmlTagAttribute(tag, "rel")?.toLowerCase();

    if (!rel) {
      continue;
    }

    const relValues = new Set(rel.split(/\s+/));

    if (relMatchers.some((matcher) => relValues.has(matcher))) {
      return getHtmlTagAttribute(tag, "href");
    }
  }

  return null;
};

export const resolveMetadataUrl = (
  rawUrl: string | null | undefined,
  baseUrl: string,
) => {
  if (!rawUrl) {
    return null;
  }

  try {
    const resolvedUrl = new URL(decodeHtmlEntities(rawUrl.trim()), baseUrl);

    return validateUrl(resolvedUrl.toString());
  } catch {
    return null;
  }
};

export const extractHtmlPageMetadata = (
  html: string,
  normalizedUrl: string,
): HtmlPageMetadata => {
  const rawTitle =
    getMetaContent(html, ["og:title", "twitter:title"]) ?? getTitleTag(html);
  const rawDescription = getMetaContent(html, [
    "og:description",
    "twitter:description",
    "description",
  ]);
  const rawImage = getMetaContent(html, [
    "og:image:secure_url",
    "og:image",
    "twitter:image",
  ]);
  const rawFavicon = getLinkHref(html, ["icon", "shortcut"]) ?? "/favicon.ico";

  return {
    title: sanitizeNullableMetadataText(rawTitle, 300),
    description: sanitizeNullableMetadataText(rawDescription, 500),
    imageUrl: resolveMetadataUrl(rawImage, normalizedUrl),
    faviconUrl: resolveMetadataUrl(rawFavicon, normalizedUrl),
  };
};
