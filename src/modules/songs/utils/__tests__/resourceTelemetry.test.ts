import {
  getErrorNameForTelemetry,
  sanitizeResourceUrlForTelemetry,
} from "../resourceTelemetry";

describe("resourceTelemetry", () => {
  describe("sanitizeResourceUrlForTelemetry", () => {
    it("keeps only the protocol and hostname for valid URLs", () => {
      expect(
        sanitizeResourceUrlForTelemetry(
          "https://example.com/resource?token=secret#user-id",
        ),
      ).toBe("https://example.com");
    });

    it("returns an invalid URL placeholder for malformed URLs", () => {
      expect(sanitizeResourceUrlForTelemetry("not a url?token=secret")).toBe(
        "[invalid-url]",
      );
    });
  });

  describe("getErrorNameForTelemetry", () => {
    it("returns Error instance names", () => {
      expect(getErrorNameForTelemetry(new TypeError("Invalid URL"))).toBe(
        "TypeError",
      );
    });

    it("returns object name properties when available", () => {
      expect(getErrorNameForTelemetry({ name: "CustomParseError" })).toBe(
        "CustomParseError",
      );
    });

    it("falls back to Unknown for unnamed errors", () => {
      expect(getErrorNameForTelemetry("Invalid URL")).toBe("Unknown");
    });
  });
});
