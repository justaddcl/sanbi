import { pluralize } from "@lib/string";

describe("pluralize string lib function", () => {
  it("should return the singular form when the count is one", () => {
    const count = 1;
    const singular = "song";
    const plural = "songs";
    const result = pluralize(count, { singular, plural });

    expect(result).toBe(singular);
  });

  it("should return the plural form when the count is not one", () => {
    const count = 2;
    const singular = "song";
    const plural = "songs";
    const result = pluralize(count, { singular, plural });

    expect(result).toBe(plural);
  });

  it("should return the plural form when the count is zero", () => {
    const count = 0;
    const singular = "song";
    const plural = "songs";
    const result = pluralize(count, { singular, plural });

    expect(result).toBe(plural);
  });
});
