import { type ReactNode } from "react";
import { MusicNoteSimpleIcon, TagIcon } from "@phosphor-icons/react/dist/ssr";

import { CommandItem, CommandList } from "@components/ui/command";
import { HStack } from "@components/HStack";
import { type SearchFilter } from "@modules/search/utils/getVisibleGlobalSearchResults";
import { cn } from "@lib/utils";

import { SearchGroupHeading } from "./SearchGroupHeading";
import { SearchResultGroup } from "./SearchResultGroup";
import { SearchSongRow, SearchTagMatchedSongRow } from "./SearchResultRows";
import { SearchResultsEmptyState } from "./SearchResultsEmptyState";
import { SearchResultsErrorState } from "./SearchResultsErrorState";
import { SearchResultsLoadingState } from "./SearchResultsLoadingState";
import { type SearchSongResult, type TagSearchResult } from "./types";

type SearchResultsListProps = {
  activeFilter: SearchFilter;
  emptyResultsMessage: string;
  hasOverflow: boolean;
  isError: boolean;
  isLoading: boolean;
  normalizedSearchInput: string;
  onSongSelect: (songId: string) => void;
  resultCountLabel: string;
  visibleResultCount: number;
  visibleSongResults: SearchSongResult[];
  visibleTagResults: TagSearchResult[];
};

const resultItemClassName =
  "min-h-16 items-center rounded-md px-3 py-3 sm:min-h-0 sm:py-2.5 data-[selected='true']:bg-slate-100";

const SEARCH_RESULT_GROUP_HEADING_ICON_SIZE = 15;

export const SearchResultsList = ({
  activeFilter,
  emptyResultsMessage,
  hasOverflow,
  isError,
  isLoading,
  normalizedSearchInput,
  onSongSelect,
  resultCountLabel,
  visibleResultCount,
  visibleSongResults,
  visibleTagResults,
}: SearchResultsListProps) => {
  const shouldShowResultGroupHeadings = activeFilter === "all";

  const renderSongResultItem = ({
    keyPrefix,
    result,
    row,
    valuePrefix,
  }: {
    keyPrefix: string;
    result: SearchSongResult;
    row: ReactNode;
    valuePrefix: string;
  }) => (
    <CommandItem
      key={`${keyPrefix}-${result.songId}`}
      value={`${valuePrefix}-${result.songId}`}
      data-song-id={result.songId}
      className={resultItemClassName}
      onSelect={() => onSongSelect(result.songId)}
    >
      {row}
    </CommandItem>
  );

  return (
    <CommandList className="max-h-[calc(100dvh_-_132px)] px-2 py-2 sm:max-h-[min(520px,calc(100dvh_-_180px))]">
      {isLoading && <SearchResultsLoadingState />}
      {!isLoading && isError && <SearchResultsErrorState />}
      {!isLoading && !isError && visibleResultCount === 0 && (
        <SearchResultsEmptyState message={emptyResultsMessage} />
      )}
      {!isLoading && !isError && visibleResultCount > 0 && (
        <HStack className="items-center justify-between px-3 pt-1 pb-2 text-[11px] font-medium text-slate-500">
          <span>Search results ({resultCountLabel})</span>
          {hasOverflow && <span>Showing top matches</span>}
        </HStack>
      )}
      {!isLoading && !isError && visibleSongResults.length > 0 && (
        <SearchResultGroup
          heading={
            shouldShowResultGroupHeadings ? (
              <SearchGroupHeading
                icon={
                  <MusicNoteSimpleIcon
                    aria-hidden
                    size={SEARCH_RESULT_GROUP_HEADING_ICON_SIZE}
                  />
                }
                label="Songs"
              />
            ) : undefined
          }
          value="songs"
        >
          {visibleSongResults.map((result) =>
            renderSongResultItem({
              keyPrefix: "song",
              result,
              row: (
                <SearchSongRow query={normalizedSearchInput} result={result} />
              ),
              valuePrefix: "song",
            }),
          )}
        </SearchResultGroup>
      )}
      {!isLoading && !isError && visibleTagResults.length > 0 && (
        <SearchResultGroup
          className={cn(
            shouldShowResultGroupHeadings &&
              visibleSongResults.length > 0 &&
              "mt-5 pt-1",
          )}
          heading={
            shouldShowResultGroupHeadings ? (
              <SearchGroupHeading
                icon={
                  <TagIcon
                    aria-hidden
                    size={SEARCH_RESULT_GROUP_HEADING_ICON_SIZE}
                  />
                }
                label="Tags"
              />
            ) : undefined
          }
          value="tags"
        >
          {visibleTagResults.map((result) =>
            renderSongResultItem({
              keyPrefix: "tag-song",
              result,
              row: (
                <SearchTagMatchedSongRow
                  query={normalizedSearchInput}
                  result={result}
                />
              ),
              valuePrefix: "tag-song",
            }),
          )}
        </SearchResultGroup>
      )}
    </CommandList>
  );
};
