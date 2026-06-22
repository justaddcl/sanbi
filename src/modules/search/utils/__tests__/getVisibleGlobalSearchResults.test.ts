import {
  getVisibleGlobalSearchResults,
  GLOBAL_SEARCH_DIALOG_RESULT_LIMIT,
  GLOBAL_SEARCH_PREVIEW_RESULT_LIMIT,
} from "../getVisibleGlobalSearchResults";

const makeResults = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`);

describe("getVisibleGlobalSearchResults", () => {
  it("does not report overflow when all results fit in the dialog", () => {
    const songResults = makeResults("song", GLOBAL_SEARCH_DIALOG_RESULT_LIMIT);
    const noTagResults: string[] = [];

    const visibleResults = getVisibleGlobalSearchResults({
      activeFilter: "songs",
      songResults,
      tagResults: noTagResults,
    });

    expect(visibleResults.visibleSongResults).toEqual(songResults);
    expect(visibleResults.visibleTagResults).toEqual(noTagResults);
    expect(visibleResults.hasOverflow).toBe(false);
  });

  it("reports overflow when the fetched preview has one more result than fits", () => {
    const songResults = makeResults("song", GLOBAL_SEARCH_PREVIEW_RESULT_LIMIT);
    const noTagResults: string[] = [];

    const visibleResults = getVisibleGlobalSearchResults({
      activeFilter: "songs",
      songResults,
      tagResults: noTagResults,
    });

    expect(visibleResults.visibleSongResults).toEqual(
      songResults.slice(0, GLOBAL_SEARCH_DIALOG_RESULT_LIMIT),
    );
    expect(visibleResults.hasOverflow).toBe(true);
  });

  it("balances all results by favoring songs and reserving up to three tag rows", () => {
    const songResults = makeResults("song", 9);
    const tagResults = makeResults("tag", 4);
    const expectedSongResultCount = 5;
    const expectedTagResultCount = 3;

    const visibleResults = getVisibleGlobalSearchResults({
      activeFilter: "all",
      songResults,
      tagResults,
    });

    expect(visibleResults.visibleSongResults).toEqual(
      songResults.slice(0, expectedSongResultCount),
    );
    expect(visibleResults.visibleTagResults).toEqual(
      tagResults.slice(0, expectedTagResultCount),
    );
    expect(
      visibleResults.visibleSongResults.length +
        visibleResults.visibleTagResults.length,
    ).toBe(GLOBAL_SEARCH_DIALOG_RESULT_LIMIT);
    expect(visibleResults.hasOverflow).toBe(true);
  });

  it("fills unused song slots with tag rows in all results", () => {
    const songResults = makeResults("song", 2);
    const tagResults = makeResults("tag", 5);

    const visibleResults = getVisibleGlobalSearchResults({
      activeFilter: "all",
      songResults,
      tagResults,
    });

    expect(visibleResults.visibleSongResults).toEqual(songResults);
    expect(visibleResults.visibleTagResults).toEqual(tagResults);
    expect(visibleResults.hasOverflow).toBe(false);
  });

  it("caps song and tag filters to only their matching result type", () => {
    const songResults = makeResults("song", GLOBAL_SEARCH_PREVIEW_RESULT_LIMIT);
    const tagResults = makeResults("tag", GLOBAL_SEARCH_PREVIEW_RESULT_LIMIT);

    const visibleSongResults = getVisibleGlobalSearchResults({
      activeFilter: "songs",
      songResults,
      tagResults,
    });
    const visibleTagResults = getVisibleGlobalSearchResults({
      activeFilter: "tags",
      songResults,
      tagResults,
    });

    expect(visibleSongResults.visibleSongResults).toEqual(
      songResults.slice(0, GLOBAL_SEARCH_DIALOG_RESULT_LIMIT),
    );
    expect(visibleSongResults.visibleTagResults).toEqual([]);
    expect(visibleSongResults.hasOverflow).toBe(true);

    expect(visibleTagResults.visibleSongResults).toEqual([]);
    expect(visibleTagResults.visibleTagResults).toEqual(
      tagResults.slice(0, GLOBAL_SEARCH_DIALOG_RESULT_LIMIT),
    );
    expect(visibleTagResults.hasOverflow).toBe(true);
  });
});
