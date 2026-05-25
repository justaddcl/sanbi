import {
  getHostnameFromUrl,
  isPreviewableResourceUrl,
} from "../resourcePreviewUrl";

describe("resourcePreviewUrl", () => {
  describe("isPreviewableResourceUrl", () => {
    it("allows HTTPS URLs with hostnames", () => {
      expect(isPreviewableResourceUrl("https://example.com/watch")).toBe(true);
    });

    it("rejects non-HTTPS and incomplete URLs", () => {
      expect(isPreviewableResourceUrl("http://example.com/watch")).toBe(false);
      expect(isPreviewableResourceUrl("https://localhost")).toBe(false);
      expect(isPreviewableResourceUrl("not a url")).toBe(false);
    });

    it("rejects IP-literal URLs", () => {
      expect(isPreviewableResourceUrl("https://127.0.0.1/watch")).toBe(false);
      expect(isPreviewableResourceUrl("https://[::1]/watch")).toBe(false);
    });
  });

  describe("getHostnameFromUrl", () => {
    it("returns a display hostname without a www prefix", () => {
      expect(getHostnameFromUrl("https://www.youtube.com/watch?v=1")).toBe(
        "youtube.com",
      );
    });

    it("returns the trimmed input when the URL is invalid", () => {
      expect(getHostnameFromUrl("  not a url  ")).toBe("not a url");
    });
  });
});
