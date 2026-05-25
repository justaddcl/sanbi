import { stripHtmlMarkup } from "@lib/string";

describe("stripHtmlMarkup", () => {
  it("strips tags while preserving readable text", () => {
    expect(stripHtmlMarkup("  <b>Preview</b>   title  ")).toBe(
      "  Preview   title  ",
    );
  });

  it("removes dangerous and malformed markup", () => {
    expect(stripHtmlMarkup("Hello <script>alert('xss')")).toBe("Hello ");
    expect(stripHtmlMarkup('Hello <img src="x" onerror="alert(1)"')).toBe(
      "Hello ",
    );
  });

  it("preserves decoded text use cases for metadata callers", () => {
    expect(stripHtmlMarkup("Hello &amp; World")).toBe("Hello &amp; World");
  });
});
