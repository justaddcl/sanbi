import { type ReactNode, useEffect, useRef, useState } from "react";
import { MusicNoteSimpleIcon, TagIcon } from "@phosphor-icons/react/dist/ssr";

import { CommandItem, CommandList } from "@components/ui/command";
import { HStack } from "@components/HStack";
import { type SearchFilter } from "@modules/search/utils/getVisibleGlobalSearchResults";
import { cn } from "@lib/utils";

import { SearchGroupHeading } from "./SearchGroupHeading";
import { SearchResultActions } from "./SearchResultActions";
import { SearchResultGroup } from "./SearchResultGroup";
import { SearchSongRow, SearchTagMatchedSongRow } from "./SearchResultRows";
import { SearchResultsEmptyState } from "./SearchResultsEmptyState";
import { SearchResultsErrorState } from "./SearchResultsErrorState";
import { SearchResultsLoadingState } from "./SearchResultsLoadingState";
import { type SearchSongResult, type TagSearchResult } from "./types";

export type SearchResultMatchType = "song" | "tag";

type SearchResultActionsConfig = {
  onAddSongToCurrentSet?: (result: SearchSongResult) => void;
  onAddSongToSet: (result: SearchSongResult) => void;
  onOpenSong: (songId: string) => void;
};

type SearchResultsListProps = {
  actions?: SearchResultActionsConfig;
  activeFilter: SearchFilter;
  emptyResultsMessage: string;
  hasOverflow: boolean;
  isError: boolean;
  isLoading: boolean;
  normalizedSearchInput: string;
  onSongSelect: (
    result: SearchSongResult,
    matchType: SearchResultMatchType,
  ) => void;
  resultCountLabel: string;
  visibleResultCount: number;
  visibleSongResults: SearchSongResult[];
  visibleTagResults: TagSearchResult[];
};

const resultItemClassName =
  "min-h-16 items-center rounded-md px-3 py-3 sm:min-h-0 sm:py-2.5 data-[selected='true']:bg-slate-100";

const SEARCH_RESULT_GROUP_HEADING_ICON_SIZE = 15;

export const SearchResultsList = ({
  actions,
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
  const canAddToCurrentSet = !!actions?.onAddSongToCurrentSet;
  const hasResultActions = !!actions;
  const [openActionsSongId, setOpenActionsSongId] = useState<string | null>(
    null,
  );
  const listRef = useRef<HTMLDivElement>(null);
  const suppressNextSongSelectRef = useRef(false);

  useEffect(() => {
    if (!hasResultActions) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (openActionsSongId && event.key === "Enter" && !event.shiftKey) {
        const target = event.target;
        if (
          target instanceof Element &&
          target.closest("[data-search-result-actions-menu='true']")
        ) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (event.key !== "Enter" || !event.shiftKey) {
        return;
      }

      const selectedItem = listRef.current?.querySelector(
        "[cmdk-item][data-selected='true'][data-song-id]",
      );

      if (!(selectedItem instanceof HTMLElement)) {
        return;
      }

      const selectedSongId = selectedItem.dataset.songId;
      if (!selectedSongId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setOpenActionsSongId(selectedSongId);
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });

    return () =>
      document.removeEventListener("keydown", handleKeyDown, {
        capture: true,
      });
  }, [hasResultActions, openActionsSongId]);

  const suppressNextSongSelect = () => {
    suppressNextSongSelectRef.current = true;
    window.setTimeout(() => {
      suppressNextSongSelectRef.current = false;
    }, 0);
  };

  useEffect(() => {
    if (!hasResultActions || !openActionsSongId) {
      return;
    }

    const isOpenActionSongVisible =
      visibleSongResults.some((result) => result.songId === openActionsSongId) ||
      visibleTagResults.some((result) => result.songId === openActionsSongId);

    if (isOpenActionSongVisible) {
      return;
    }

    const clearStaleOpenActions = window.setTimeout(() => {
      setOpenActionsSongId(null);
    }, 0);

    return () => window.clearTimeout(clearStaleOpenActions);
  }, [
    hasResultActions,
    openActionsSongId,
    visibleSongResults,
    visibleTagResults,
  ]);

  const renderSongResultItem = ({
    keyPrefix,
    matchType,
    result,
    row,
    valuePrefix,
  }: {
    keyPrefix: string;
    matchType: SearchResultMatchType;
    result: SearchSongResult;
    row: ReactNode;
    valuePrefix: string;
  }) => (
    <CommandItem
      key={`${keyPrefix}-${result.songId}`}
      value={`${valuePrefix}-${result.songId}`}
      data-song-id={result.songId}
      data-search-match-type={matchType}
      className={resultItemClassName}
      onSelect={() => {
        if (
          hasResultActions &&
          (openActionsSongId || suppressNextSongSelectRef.current)
        ) {
          suppressNextSongSelectRef.current = false;
          return;
        }

        onSongSelect(result, matchType);
      }}
    >
      {row}
      {actions && (
        <SearchResultActions
          canAddToCurrentSet={canAddToCurrentSet}
          open={openActionsSongId === result.songId}
          result={result}
          onAddToCurrentSet={
            actions.onAddSongToCurrentSet ?? actions.onAddSongToSet
          }
          onAddToSet={actions.onAddSongToSet}
          onActionSelect={suppressNextSongSelect}
          onOpenChange={(open) => {
            setOpenActionsSongId(open ? result.songId : null);
          }}
          onOpenSong={actions.onOpenSong}
        />
      )}
    </CommandItem>
  );

  return (
    <CommandList
      ref={listRef}
      className="max-h-[calc(100dvh_-_132px)] px-2 py-2 sm:max-h-[min(520px,calc(100dvh_-_180px))]"
    >
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
              matchType: "song",
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
              matchType: "tag",
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
