import { capitalize } from "@lib/string";

describe("Capitalize string lib function", () => {
  it("should convert the first character of the string to upper case", () => {
    const testString = "stoneway";

    const result = capitalize(testString);

    expect(result).toBe("Stoneway");
  });

  it("should not convert any other characters of the given string to upper case other than the first character", () => {
    const testString = "STONEWAY";

    const result = capitalize(testString);

    expect(result).toBe("Stoneway");
  });

  it("should not change the string if it is already capitalized", () => {
    const testString = "Stoneway";

    const result = capitalize(testString);

    expect(result).toBe(testString);
  });

  it("should only convert the first character of the first word", () => {
    const testString = "stoneway church";

    const result = capitalize(testString);

    expect(result).toBe("Stoneway church");
  });
});
