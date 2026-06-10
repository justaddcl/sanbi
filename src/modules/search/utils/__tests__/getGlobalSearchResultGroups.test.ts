import { getGlobalSearchResultGroups } from "../getGlobalSearchResultGroups";

const songSearchResult = {
  songId: "song-1",
  name: "Amazing Grace",
  matchedTags: [],
};

describe("getGlobalSearchResultGroups", () => {
  it("uses backend matched tags so fuzzy tag matches stay in tag results", () => {
    const results = getGlobalSearchResultGroups({
      normalizedSearchQuery: "commnion",
      searchResults: [
        {
          ...songSearchResult,
          matchedTags: ["Communion"],
        },
      ],
    });

    expect(results.songResults).toEqual([]);
    expect(results.tagResults).toEqual([
      {
        ...songSearchResult,
        matchedTags: ["Communion"],
      },
    ]);
  });

  it("keeps fuzzy song matches in song results when no tag matched", () => {
    const results = getGlobalSearchResultGroups({
      normalizedSearchQuery: "amazng",
      searchResults: [songSearchResult],
    });

    expect(results.songResults).toEqual([songSearchResult]);
    expect(results.tagResults).toEqual([]);
  });

  it("sorts matched tags for stable display", () => {
    const results = getGlobalSearchResultGroups({
      normalizedSearchQuery: "com",
      searchResults: [
        {
          ...songSearchResult,
          matchedTags: ["Community", "Communion"],
        },
      ],
    });

    expect(results.tagResults[0]?.matchedTags).toEqual([
      "Communion",
      "Community",
    ]);
  });
});
