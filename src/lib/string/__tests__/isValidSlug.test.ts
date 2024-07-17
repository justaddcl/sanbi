import { isValidSlug } from "@lib/string";

describe("isValidSlug string lib function", () => {
  describe("should return `true`", () => {
    it("if the slug only contains valid characters", () => {
      const validSlug = "valid-slug";

      const result = isValidSlug(validSlug);

      expect(result).toBe(true);
    });
  });

  describe("should return `false`", () => {
    it("if the slug contains an ampersand", () => {
      const slugWithAmpersand = "&test";

      const result = isValidSlug(slugWithAmpersand);

      expect(result).toBe(false);
    });

    it("if the slug contains an underscore", () => {
      const slugWithUnderscore = "_test";

      const result = isValidSlug(slugWithUnderscore);

      expect(result).toBe(false);
    });

    it("if the slug contains a period", () => {
      const slugWithPeriod = ".test";

      const result = isValidSlug(slugWithPeriod);

      expect(result).toBe(false);
    });

    it("if the slug contains special characters", () => {
      const slugWithSpecialCharacter = "țest";

      const result = isValidSlug(slugWithSpecialCharacter);

      expect(result).toBe(false);
    });

    it("if the slug contains a plus sign", () => {
      const slugWithPlusSign = "+test";

      const result = isValidSlug(slugWithPlusSign);

      expect(result).toBe(false);
    });

    it("if the slug contains a comma", () => {
      const slugWithComma = ",test";

      const result = isValidSlug(slugWithComma);

      expect(result).toBe(false);
    });

    it("if the slug contains a colon", () => {
      const slugWithColon = ":test";

      const result = isValidSlug(slugWithColon);

      expect(result).toBe(false);
    });

    it("if the slug contains a semi-colon", () => {
      const slugWithSemiColon = ";test";

      const result = isValidSlug(slugWithSemiColon);

      expect(result).toBe(false);
    });

    it("if the slug contains a quotation mark", () => {
      const slugWithQUotationMark = '"test';

      const result = isValidSlug(slugWithQUotationMark);

      expect(result).toBe(false);
    });
  });
});
