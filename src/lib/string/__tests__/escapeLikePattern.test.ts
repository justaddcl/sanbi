import { escapeLikePattern } from "../escapeLikePattern";

describe("escapeLikePattern", () => {
  it("escapes SQL LIKE wildcard and escape characters", () => {
    expect(escapeLikePattern(String.raw`100%_sure\path`)).toBe(
      String.raw`100\%\_sure\\path`,
    );
  });

  it("leaves ordinary search text unchanged", () => {
    expect(escapeLikePattern("amazing grace")).toBe("amazing grace");
  });
});
