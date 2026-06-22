export type SearchFilter = "all" | "songs" | "tags";

export type VisibleGlobalSearchResultsInput<SongResult, TagResult> = {
  activeFilter: SearchFilter;
  songResults: SongResult[];
  tagResults: TagResult[];
};

export const GLOBAL_SEARCH_DIALOG_RESULT_LIMIT = 8;
export const GLOBAL_SEARCH_PREVIEW_RESULT_LIMIT =
  GLOBAL_SEARCH_DIALOG_RESULT_LIMIT + 1;
export const GLOBAL_SEARCH_RESULT_COUNT_LIMIT = 50;

export const GLOBAL_SEARCH_DIALOG_MAX_TAG_ROWS_IN_ALL_RESULTS = 3;

export const getVisibleGlobalSearchResults = <SongResult, TagResult>({
  activeFilter,
  songResults,
  tagResults,
}: VisibleGlobalSearchResultsInput<SongResult, TagResult>) => {
  if (activeFilter === "songs") {
    const visibleSongResults = songResults.slice(
      0,
      GLOBAL_SEARCH_DIALOG_RESULT_LIMIT,
    );

    return {
      visibleSongResults,
      visibleTagResults: [] as TagResult[],
      hasOverflow: songResults.length > visibleSongResults.length,
    };
  }

  if (activeFilter === "tags") {
    const visibleTagResults = tagResults.slice(
      0,
      GLOBAL_SEARCH_DIALOG_RESULT_LIMIT,
    );

    return {
      visibleSongResults: [] as SongResult[],
      visibleTagResults,
      hasOverflow: tagResults.length > visibleTagResults.length,
    };
  }

  const targetTagRowCount =
    tagResults.length > 0
      ? Math.min(
          GLOBAL_SEARCH_DIALOG_MAX_TAG_ROWS_IN_ALL_RESULTS,
          tagResults.length,
        )
      : 0;
  const visibleSongResults = songResults.slice(
    0,
    GLOBAL_SEARCH_DIALOG_RESULT_LIMIT - targetTagRowCount,
  );
  const availableTagSlots =
    GLOBAL_SEARCH_DIALOG_RESULT_LIMIT - visibleSongResults.length;
  const visibleTagResults = tagResults.slice(0, availableTagSlots);

  return {
    visibleSongResults,
    visibleTagResults,
    hasOverflow:
      songResults.length + tagResults.length >
      visibleSongResults.length + visibleTagResults.length,
  };
};
