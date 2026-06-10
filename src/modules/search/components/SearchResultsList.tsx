import { type ReactNode } from "react";
import { MusicNoteSimple, Tag } from "@phosphor-icons/react/dist/ssr";
import { CommandLoading } from "cmdk";

import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@components/ui/command";
import { HStack } from "@components/HStack";
import { type SearchFilter } from "@modules/search/utils/getVisibleGlobalSearchResults";
import { cn } from "@lib/utils";

import {
  SearchResultSkeletonRows,
  SearchSongRow,
  SearchTagMatchedSongRow,
} from "./SearchResultRows";
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

const SearchGroupHeading = ({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) => (
  <HStack className="items-center gap-1.5">
    <span className="text-slate-400">{icon}</span>
    <span>{label}</span>
  </HStack>
);

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
      {isLoading && (
        <CommandLoading>
          <SearchResultSkeletonRows />
        </CommandLoading>
      )}
      {!isLoading && isError && (
        <CommandEmpty>
          Search is unavailable. Please try again in a moment.
        </CommandEmpty>
      )}
      {!isLoading && !isError && visibleResultCount === 0 && (
        <CommandEmpty>{emptyResultsMessage}</CommandEmpty>
      )}
      {!isLoading && !isError && visibleResultCount > 0 && (
        <HStack className="items-center justify-between px-3 pt-1 pb-2 text-[11px] font-medium text-slate-500">
          <span>Search results ({resultCountLabel})</span>
          {hasOverflow && <span>Showing top matches</span>}
        </HStack>
      )}
      {!isLoading && !isError && visibleSongResults.length > 0 && (
        <CommandGroup
          className="[&_[cmdk-group-heading]]:px-3"
          heading={
            shouldShowResultGroupHeadings ? (
              <SearchGroupHeading
                icon={<MusicNoteSimple aria-hidden size={15} />}
                label="Songs"
              />
            ) : undefined
          }
          value="songs"
        >
          <div className="grid gap-0.5">
            {visibleSongResults.map((result) =>
              renderSongResultItem({
                keyPrefix: "song",
                result,
                row: (
                  <SearchSongRow
                    query={normalizedSearchInput}
                    result={result}
                  />
                ),
                valuePrefix: "song",
              }),
            )}
          </div>
        </CommandGroup>
      )}
      {!isLoading && !isError && visibleTagResults.length > 0 && (
        <CommandGroup
          className={cn(
            "[&_[cmdk-group-heading]]:px-3",
            shouldShowResultGroupHeadings &&
              visibleSongResults.length > 0 &&
              "mt-5 pt-1",
          )}
          heading={
            shouldShowResultGroupHeadings ? (
              <SearchGroupHeading
                icon={<Tag aria-hidden size={15} />}
                label="Tags"
              />
            ) : undefined
          }
          value="tags"
        >
          <div className="grid gap-0.5">
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
          </div>
        </CommandGroup>
      )}
    </CommandList>
  );
};
