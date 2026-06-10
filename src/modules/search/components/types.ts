import { type SearchFilter } from "@modules/search/utils/getVisibleGlobalSearchResults";
import { type RouterOutputs } from "@lib/trpc";

export type SearchSongResult = RouterOutputs["song"]["search"][number];

export type TagSearchResult = SearchSongResult & {
  matchedTags: string[];
};

export type SearchToggleFilter = Exclude<SearchFilter, "all">;

export const searchFilters: { label: string; value: SearchToggleFilter }[] = [
  { label: "Songs", value: "songs" },
  { label: "Tags", value: "tags" },
];
