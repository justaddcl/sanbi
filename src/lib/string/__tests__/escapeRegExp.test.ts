import { escapeRegExp } from "../escapeRegExp";

describe("escapeRegExp", () => {
  it("escapes characters with special meaning in regular expressions", () => {
    expect(escapeRegExp("Amazing (Grace) [Live]?")).toBe(
      "Amazing \\(Grace\\) \\[Live\\]\\?",
    );
  });

  it("leaves ordinary text unchanged", () => {
    expect(escapeRegExp("Amazing Grace")).toBe("Amazing Grace");
  });
});
