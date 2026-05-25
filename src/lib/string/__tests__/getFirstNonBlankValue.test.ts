import { getFirstNonBlankValue } from "../getFirstNonBlankValue";

describe("getFirstNonBlankValue", () => {
  it("returns the first trimmed non-blank value", () => {
    expect(getFirstNonBlankValue(null, undefined, "   ", "  Name  ")).toBe(
      "Name",
    );
  });

  it("returns undefined when every value is blank", () => {
    expect(getFirstNonBlankValue(null, undefined, "   ")).toBeUndefined();
  });
});
