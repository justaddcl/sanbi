import { formatNumber, type FormatNumberOptions } from "../formatNumber";

describe("formatNumber", () => {
  describe("default behavior (no options)", () => {
    it("formats integers with thousand separators", () => {
      expect(formatNumber(1234567)).toBe("1,234,567");
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(100)).toBe("100");
    });

    it("preserves decimal places", () => {
      expect(formatNumber(1234.56)).toBe("1,234.56");
      expect(formatNumber(1234.44)).toBe("1,234.44");
      expect(formatNumber(0.51)).toBe("0.51");
      expect(formatNumber(0.49)).toBe("0.49");
    });

    it("handles negative numbers", () => {
      expect(formatNumber(-1234567)).toBe("-1,234,567");
      expect(formatNumber(-1234.56)).toBe("-1,234.56");
    });

    it("handles zero", () => {
      expect(formatNumber(0)).toBe("0");
      // Note: JavaScript's Number type doesn't distinguish between 0 and -0 in string representation
      expect(formatNumber(-0)).toBe("-0");
    });
  });

  describe("custom locale", () => {
    it("formats numbers according to the specified locale", () => {
      const options: FormatNumberOptions = { locale: "de-DE" };
      // German uses dots for thousands and comma for decimals
      expect(formatNumber(1234567, options)).toBe("1.234.567");
      expect(formatNumber(-1234567, options)).toBe("-1.234.567");
    });
  });

  describe("custom number format options", () => {
    it("supports decimal places configuration", () => {
      const options: FormatNumberOptions = {
        options: {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      };
      expect(formatNumber(1234.567, options)).toBe("1,234.57");
      expect(formatNumber(1234, options)).toBe("1,234.00");
    });

    it("supports currency formatting", () => {
      const options: FormatNumberOptions = {
        options: {
          style: "currency",
          currency: "USD",
        },
      };
      expect(formatNumber(1234.56, options)).toBe("$1,234.56");
      expect(formatNumber(1234, options)).toBe("$1,234.00");
    });

    it("supports percentage formatting", () => {
      const options: FormatNumberOptions = {
        options: {
          style: "percent",
        },
      };
      expect(formatNumber(0.1234, options)).toBe("12%");
      expect(formatNumber(1, options)).toBe("100%");
    });
  });

  describe("combined locale and format options", () => {
    it("applies both locale and format options", () => {
      const options: FormatNumberOptions = {
        locale: "de-DE",
        options: {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      };
      expect(formatNumber(1234.56, options)).toBe("1.234,56");
    });
  });
});
