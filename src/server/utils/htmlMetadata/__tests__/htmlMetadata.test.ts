import {
  decodeHtmlEntities,
  extractHtmlPageMetadata,
  getHtmlTagAttribute,
  getLinkHref,
  getMetaContent,
  getTitleTag,
  resolveMetadataUrl,
  sanitizeNullableMetadataText,
} from "../htmlMetadata";

describe("htmlMetadata", () => {
  describe("decodeHtmlEntities", () => {
    it("decodes named and numeric HTML entities", () => {
      expect(decodeHtmlEntities("Rock &amp; Roll &#39;Live&#39;")).toBe(
        "Rock & Roll 'Live'",
      );
    });
  });

  describe("getHtmlTagAttribute", () => {
    it("reads quoted, single-quoted, and unquoted attributes", () => {
      expect(
        getHtmlTagAttribute('<meta content="Quoted value">', "content"),
      ).toBe("Quoted value");
      expect(
        getHtmlTagAttribute("<meta content='Single quoted'>", "content"),
      ).toBe("Single quoted");
      expect(getHtmlTagAttribute("<meta content=Unquoted>", "content")).toBe(
        "Unquoted",
      );
    });

    it("decodes attribute entities", () => {
      expect(
        getHtmlTagAttribute('<meta content="Tom &amp; Jerry">', "content"),
      ).toBe("Tom & Jerry");
    });
  });

  describe("metadata tag readers", () => {
    const html = `
      <title>Fallback &amp; title</title>
      <meta name="description" content="Fallback description">
      <meta property="og:title" content="OG &amp; title">
      <link rel="shortcut icon" href="/favicon.png">
    `;

    it("reads matching meta content by priority", () => {
      expect(getMetaContent(html, ["og:title", "description"])).toBe(
        "OG & title",
      );
    });

    it("reads and decodes the title tag", () => {
      expect(getTitleTag(html)).toBe("Fallback & title");
    });

    it("reads matching link hrefs by rel token", () => {
      expect(getLinkHref(html, ["icon"])).toBe("/favicon.png");
    });
  });

  describe("resolveMetadataUrl", () => {
    it("normalizes and rejects invalid media URLs", () => {
      expect(
        resolveMetadataUrl("../cover.png", "https://example.com/a/b"),
      ).toBe("https://example.com/cover.png");
      expect(
        resolveMetadataUrl(
          "http://example.com/cover.png",
          "https://example.com",
        ),
      ).toBeNull();
      expect(
        resolveMetadataUrl(
          "https://127.0.0.1/cover.png",
          "https://example.com",
        ),
      ).toBeNull();
    });
  });

  describe("sanitizeNullableMetadataText", () => {
    it("trims, strips markup, decodes entities, and truncates text", () => {
      expect(
        sanitizeNullableMetadataText("  <b>Preview</b>   title  ", 13),
      ).toBe("Preview title");
      expect(sanitizeNullableMetadataText("Long preview title", 12)).toBe(
        "Long preview",
      );
      expect(sanitizeNullableMetadataText("Hello &amp; World", 50)).toBe(
        "Hello & World",
      );
      expect(sanitizeNullableMetadataText("   ", 12)).toBeNull();
    });
  });

  describe("extractHtmlPageMetadata", () => {
    it("extracts OpenGraph metadata before falling back to HTML tags", () => {
      const metadata = extractHtmlPageMetadata(
        `
          <html>
            <head>
              <title>Fallback title</title>
              <meta property="og:title" content="OG &amp; title" />
              <meta name="description" content="Fallback description" />
              <meta property="og:description" content="OG description" />
              <meta property="og:image" content="/images/cover.jpg" />
              <link rel="icon" href="/favicon.png" />
            </head>
          </html>
        `,
        "https://example.com/songs/one",
      );

      expect(metadata).toEqual({
        title: "OG & title",
        description: "OG description",
        imageUrl: "https://example.com/images/cover.jpg",
        faviconUrl: "https://example.com/favicon.png",
      });
    });
  });
});
