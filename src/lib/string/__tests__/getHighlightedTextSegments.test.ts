import { getHighlightedTextSegments } from "../getHighlightedTextSegments";

describe("getHighlightedTextSegments", () => {
  it("marks exact case-insensitive query matches", () => {
    expect(
      getHighlightedTextSegments({
        query: "grace",
        text: "Amazing Grace",
      }),
    ).toEqual([
      { shouldHighlight: false, text: "Amazing " },
      { shouldHighlight: true, text: "Grace" },
      { shouldHighlight: false, text: "" },
    ]);
  });

  it("returns one plain segment for blank queries", () => {
    expect(
      getHighlightedTextSegments({
        query: " ",
        text: "Amazing Grace",
      }),
    ).toEqual([{ shouldHighlight: false, text: "Amazing Grace" }]);
  });

  it("marks the closest word when fuzzy fallback is enabled", () => {
    expect(
      getHighlightedTextSegments({
        enableFuzzyFallback: true,
        query: "amazng",
        text: "Amazing Grace",
      }),
    ).toEqual([
      { shouldHighlight: true, text: "Amazing" },
      { shouldHighlight: false, text: " " },
      { shouldHighlight: false, text: "Grace" },
    ]);
  });

  it("returns plain text when the best fuzzy match is too weak", () => {
    expect(
      getHighlightedTextSegments({
        enableFuzzyFallback: true,
        query: "xyz",
        text: "Amazing Grace",
      }),
    ).toEqual([{ shouldHighlight: false, text: "Amazing Grace" }]);
  });
});
