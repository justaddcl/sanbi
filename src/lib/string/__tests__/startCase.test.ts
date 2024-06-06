import { startCase } from "@lib/string";

describe("StartCase string lib function", () => {
  it("should capitalize the first character of every word", () => {
    const testString = "stoneway church";

    const result = startCase(testString);

    expect(result).toBe("Stoneway Church");
  });

  it("should remove dashes from the given string", () => {
    const testString = "--stoneway-church--";

    const result = startCase(testString);

    expect(result).toBe("Stoneway Church");
  });

  it("should remove underscores from the given string", () => {
    const testString = "__stoneway_church__";

    const result = startCase(testString);

    expect(result).toBe("Stoneway Church");
  });

  it("should separate camelCased words", () => {
    const testString = "stonewayChurch";

    const result = startCase(testString);

    expect(result).toBe("Stoneway Church");
  });

  it("should return an empty string if passed an empty string", () => {
    const testString = "";

    const result = startCase(testString);

    expect(result).toBe("");
  });
});
