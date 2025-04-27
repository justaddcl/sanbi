import { formatNumber, type FormatNumberOptions } from "../formatNumber";

describe("formatNumber", () => {
  describe("default formatting", () => {
    it("should format whole numbers correctly", () => {
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(1000000)).toBe("1,000,000");
      expect(formatNumber(0)).toBe("0");
    });

    it("should format decimal numbers correctly", () => {
      expect(formatNumber(1000.5)).toBe("1,001");
      expect(formatNumber(1000.4)).toBe("1,000");
      expect(formatNumber(0.5)).toBe("1");
    });

    it("should handle negative numbers correctly", () => {
      expect(formatNumber(-1000)).toBe("-1,000");
      expect(formatNumber(-1000000)).toBe("-1,000,000");
      expect(formatNumber(-0.5)).toBe("-1");
    });

    it("should handle edge cases", () => {
      expect(formatNumber(Number.MAX_SAFE_INTEGER)).toBe(
        "9,007,199,254,740,991",
      );
      expect(formatNumber(Number.MIN_SAFE_INTEGER)).toBe(
        "-9,007,199,254,740,991",
      );
      expect(formatNumber(0)).toBe("0");
    });
  });

  describe("locale configuration", () => {
    it("should format numbers according to passed in locale", () => {
      const options: FormatNumberOptions = { locale: "de-DE" };
      expect(formatNumber(1000.5, options)).toBe("1.001");
      expect(formatNumber(1000000, options)).toBe("1.000.000");
    });
  });

  describe("number format options", () => {
    it("should format as currency", () => {
      const options: FormatNumberOptions = {
        options: { style: "currency", currency: "USD" },
      };
      expect(formatNumber(1000.5, options)).toBe("$1,001.00");
      expect(formatNumber(1000000, options)).toBe("$1,000,000.00");
    });

    it("should format with specific decimal places", () => {
      const options: FormatNumberOptions = {
        options: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
      };
      expect(formatNumber(1000.5, options)).toBe("1,000.50");
      expect(formatNumber(1000, options)).toBe("1,000.00");
    });

    it("should format as percentage", () => {
      const options: FormatNumberOptions = {
        options: { style: "percent" },
      };
      expect(formatNumber(0.156, options)).toBe("16%");
      expect(formatNumber(1.5, options)).toBe("150%");
    });
  });

  describe("combined locale and format options", () => {
    it("should format currency with specific locale", () => {
      const options: FormatNumberOptions = {
        locale: "de-DE",
        options: { style: "currency", currency: "EUR" },
      };
      expect(formatNumber(1000.5, options)).toBe("1.000,50 €");
      expect(formatNumber(1000000, options)).toBe("1.000.000,00 €");
    });

    it("should format percentage with specific locale", () => {
      const options: FormatNumberOptions = {
        locale: "fr-FR",
        options: { style: "percent", minimumFractionDigits: 1 },
      };
      expect(formatNumber(0.156, options)).toBe("15,6 %");
    });
  });
});
