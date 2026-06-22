export type GlobalSearchResultWithMatchedTags = {
  songId: string;
  name: string;
  matchedTags?: string[] | null;
};

type GetGlobalSearchResultGroupsInput<
  SearchResult extends GlobalSearchResultWithMatchedTags,
> = {
  normalizedSearchQuery: string;
  searchResults: SearchResult[];
};

export const getGlobalSearchResultGroups = <
  SearchResult extends GlobalSearchResultWithMatchedTags,
>({
  normalizedSearchQuery,
  searchResults,
}: GetGlobalSearchResultGroupsInput<SearchResult>) => {
  if (!normalizedSearchQuery) {
    return {
      songResults: [] as SearchResult[],
      tagResults: [] as (SearchResult & { matchedTags: string[] })[],
    };
  }

  const tagResults = searchResults
    .map((result) => ({
      ...result,
      matchedTags: [...(result.matchedTags ?? [])].sort((firstTag, secondTag) =>
        firstTag.localeCompare(secondTag),
      ),
    }))
    .filter((result) => result.matchedTags.length > 0);

  const tagResultIds = new Set(tagResults.map((result) => result.songId));
  const songResults = searchResults.filter(
    (result) =>
      result.name.toLowerCase().includes(normalizedSearchQuery) ||
      !tagResultIds.has(result.songId),
  );

  return {
    songResults,
    tagResults,
  };
};
