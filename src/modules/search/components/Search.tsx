"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { XIcon } from "@phosphor-icons/react/dist/ssr";
import { useDebounceValue } from "usehooks-ts";

import { Button } from "@components/ui/button";
import { CommandDialog, CommandInput } from "@components/ui/command";
import { HStack } from "@components/HStack";
import { getGlobalSearchResultGroups } from "@modules/search/utils/getGlobalSearchResultGroups";
import {
  getVisibleGlobalSearchResults,
  GLOBAL_SEARCH_RESULT_COUNT_LIMIT,
  type SearchFilter,
} from "@modules/search/utils/getVisibleGlobalSearchResults";
import { AddSongToSetDialog } from "@modules/songs/forms/AddSongToSet/components/AddSongToSetDialog";
import { trpc } from "@lib/trpc";
import { cn } from "@lib/utils";

import { SearchFilterControls } from "./SearchFilterControls";
import { SearchResultsList } from "./SearchResultsList";
import { SearchShortcutLegend } from "./SearchShortcutLegend";
import { SearchTrigger } from "./SearchTrigger";
import { type SearchSongResult, type SearchToggleFilter } from "./types";

type SearchProps = {
  className?: string;
};

const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_DELAY = 300;
const DIALOG_EXIT_ANIMATION_DELAY = 200;

export const Search: React.FC<SearchProps> = ({ className }) => {
  const params = useParams<{ organization?: string; setId?: string }>();
  const router = useRouter();
  const searchDescriptionId = useId();
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchInput, setDebouncedSearchInput] = useDebounceValue(
    searchInput,
    SEARCH_DEBOUNCE_DELAY,
  );
  const [selectedFilters, setSelectedFilters] = useState<
    Record<SearchToggleFilter, boolean>
  >({
    songs: false,
    tags: false,
  });
  const [songToAddToSet, setSongToAddToSet] = useState<SearchSongResult | null>(
    null,
  );
  const [isAddSongToSetDialogOpen, setIsAddSongToSetDialogOpen] =
    useState(false);
  const openRef = useRef(open);
  const clearAddSongToSetDialogTimeoutRef = useRef<number | undefined>(
    undefined,
  );

  const organizationId = params.organization;
  const currentSetId = params.setId;
  const normalizedSearchInput = debouncedSearchInput.trim();
  const normalizedSearchQuery = normalizedSearchInput.toLowerCase();
  const hasSearchableInput = searchInput.trim().length >= MIN_SEARCH_LENGTH;
  const canSearch =
    !!organizationId && normalizedSearchInput.length >= MIN_SEARCH_LENGTH;
  const isWaitingForDebounce =
    hasSearchableInput && searchInput.trim() !== normalizedSearchInput;
  const closeOrClearLabel = searchInput ? "Clear search" : "Close search";
  const escapeShortcutLabel = searchInput.trim().length > 0 ? "Clear" : "Close";
  const activeFilter: SearchFilter = useMemo(() => {
    if (selectedFilters.songs === selectedFilters.tags) {
      return "all";
    }

    return selectedFilters.songs ? "songs" : "tags";
  }, [selectedFilters]);

  const {
    data: searchResults,
    isFetching: isSearchFetching,
    isError: isSearchError,
  } = trpc.song.search.useQuery(
    {
      organizationId: organizationId ?? "",
      searchInput: normalizedSearchInput,
      limit: GLOBAL_SEARCH_RESULT_COUNT_LIMIT,
    },
    {
      enabled: canSearch,
    },
  );

  const { songResults, tagResults } = useMemo(
    () =>
      getGlobalSearchResultGroups({
        normalizedSearchQuery,
        searchResults: searchResults ?? [],
      }),
    [normalizedSearchQuery, searchResults],
  );

  const songResultIds = useMemo(
    () => new Set(songResults.map((result) => result.songId)),
    [songResults],
  );

  const visibleTagCandidateResults = useMemo(() => {
    if (activeFilter !== "all") {
      return tagResults;
    }

    return tagResults.filter((result) => !songResultIds.has(result.songId));
  }, [activeFilter, songResultIds, tagResults]);

  const {
    visibleSongResults,
    visibleTagResults,
    hasOverflow: hasSearchResultOverflow,
  } = useMemo(
    () =>
      getVisibleGlobalSearchResults({
        activeFilter,
        songResults,
        tagResults: visibleTagCandidateResults,
      }),
    [activeFilter, songResults, visibleTagCandidateResults],
  );
  const visibleResultCount =
    visibleSongResults.length + visibleTagResults.length;
  const totalResultCount = useMemo(() => {
    if (activeFilter === "songs") {
      return songResults.length;
    }

    if (activeFilter === "tags") {
      return tagResults.length;
    }

    return songResults.length + visibleTagCandidateResults.length;
  }, [activeFilter, songResults, tagResults, visibleTagCandidateResults]);
  const searchResultCountLabel =
    searchResults && searchResults.length >= GLOBAL_SEARCH_RESULT_COUNT_LIMIT
      ? `${totalResultCount}+`
      : totalResultCount.toString();
  const shouldShowLoading =
    hasSearchableInput && (isWaitingForDebounce || isSearchFetching);

  const emptyResultsMessage = useMemo(() => {
    if (!organizationId) {
      return "Search is available inside an organization.";
    }

    if (activeFilter === "songs") {
      return `No songs found for "${normalizedSearchInput}".`;
    }

    if (activeFilter === "tags") {
      return `No songs found with matching tags for "${normalizedSearchInput}".`;
    }

    return `No results found for "${normalizedSearchInput}".`;
  }, [activeFilter, normalizedSearchInput, organizationId]);

  const resetSearchInput = useCallback(() => {
    setSearchInput("");
    setDebouncedSearchInput("");
    setSelectedFilters({ songs: false, tags: false });
  }, [setDebouncedSearchInput]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(
    () => () => {
      if (clearAddSongToSetDialogTimeoutRef.current) {
        window.clearTimeout(clearAddSongToSetDialogTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "k" ||
        (!event.metaKey && !event.ctrlKey)
      ) {
        return;
      }

      event.preventDefault();
      if (openRef.current) {
        setOpen(false);
        resetSearchInput();
        return;
      }

      setOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetSearchInput]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetSearchInput();
    }
  };

  const handleInputChange = (newValue: string) => {
    setSearchInput(newValue);
  };

  const handleSearchControlClick = () => {
    if (searchInput.trim().length > 0) {
      handleInputChange("");
      return;
    }

    handleOpenChange(false);
  };

  const handleFilterToggle = (filter: SearchToggleFilter) => {
    setSelectedFilters((currentFilters) => ({
      ...currentFilters,
      [filter]: !currentFilters[filter],
    }));
  };

  const openSong = (songId: string) => {
    if (!organizationId) {
      return;
    }

    handleOpenChange(false);
    router.push(`/${organizationId}/songs/${songId}`);
  };

  const addSongToCurrentSet = (result: SearchSongResult) => {
    if (!organizationId || !currentSetId) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("addSongDialogOpen", "1");
    searchParams.set("songId", result.songId);

    handleOpenChange(false);
    router.push(`/${organizationId}/sets/${currentSetId}?${searchParams}`);
  };

  const addSongToSet = (result: SearchSongResult) => {
    if (clearAddSongToSetDialogTimeoutRef.current) {
      window.clearTimeout(clearAddSongToSetDialogTimeoutRef.current);
      clearAddSongToSetDialogTimeoutRef.current = undefined;
    }

    handleOpenChange(false);
    setSongToAddToSet(result);
    setIsAddSongToSetDialogOpen(true);
  };

  const handleAddSongToSetDialogOpenChange = (nextOpen: boolean) => {
    setIsAddSongToSetDialogOpen(nextOpen);

    if (clearAddSongToSetDialogTimeoutRef.current) {
      window.clearTimeout(clearAddSongToSetDialogTimeoutRef.current);
      clearAddSongToSetDialogTimeoutRef.current = undefined;
    }

    if (nextOpen) {
      return;
    }

    clearAddSongToSetDialogTimeoutRef.current = window.setTimeout(() => {
      setSongToAddToSet(null);
      clearAddSongToSetDialogTimeoutRef.current = undefined;
    }, DIALOG_EXIT_ANIMATION_DELAY);
  };

  const addSongToSetDialogSong = songToAddToSet
    ? {
        id: songToAddToSet.songId,
        name: songToAddToSet.name,
        preferredKey: songToAddToSet.preferredKey,
      }
    : null;

  return (
    <>
      <SearchTrigger
        className={className}
        descriptionId={searchDescriptionId}
        onOpen={() => setOpen(true)}
      />

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        dialogTitle="Search Sanbi"
        fixed
        minimalPadding
        shouldFilter={false}
        autoFocusInput={open}
        closeButton={null}
        onEscapeKeyDown={(event) => {
          if (searchInput.trim().length === 0) {
            return;
          }

          event.preventDefault();
          handleInputChange("");
        }}
        className={cn(
          "max-h-[calc(100dvh_-_24px)] overflow-hidden pb-0!",
          hasSearchableInput && "sm:pb-3!",
        )}
      >
        <div className={cn(hasSearchableInput && "border-b border-slate-100")}>
          <HStack className="items-center border-b border-slate-100 [&_[cmdk-input-wrapper]]:border-b-0">
            <div className="min-w-0 flex-1">
              <CommandInput
                value={searchInput}
                onValueChange={handleInputChange}
                placeholder="Search songs or tags"
                className="h-14 text-base md:text-base"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mr-3 h-9 w-9 shrink-0 text-slate-500 hover:text-slate-900"
              aria-label={closeOrClearLabel}
              title={closeOrClearLabel}
              onClick={handleSearchControlClick}
            >
              <XIcon aria-hidden size={16} />
            </Button>
          </HStack>
          <SearchFilterControls
            selectedFilters={selectedFilters}
            onFilterToggle={handleFilterToggle}
          />
        </div>

        {hasSearchableInput && (
          <SearchResultsList
            activeFilter={activeFilter}
            emptyResultsMessage={emptyResultsMessage}
            hasOverflow={hasSearchResultOverflow}
            isError={isSearchError}
            isLoading={shouldShowLoading}
            normalizedSearchInput={normalizedSearchInput}
            onAddSongToCurrentSet={
              currentSetId ? addSongToCurrentSet : undefined
            }
            onAddSongToSet={addSongToSet}
            onSongSelect={openSong}
            resultCountLabel={searchResultCountLabel}
            visibleResultCount={visibleResultCount}
            visibleSongResults={visibleSongResults}
            visibleTagResults={visibleTagResults}
          />
        )}
        {hasSearchableInput && (
          <SearchShortcutLegend escapeShortcutLabel={escapeShortcutLabel} />
        )}
      </CommandDialog>
      {addSongToSetDialogSong && (
        <AddSongToSetDialog
          song={addSongToSetDialogSong}
          open={isAddSongToSetDialogOpen}
          onOpenChange={handleAddSongToSetDialogOpenChange}
          trigger={null}
        />
      )}
    </>
  );
};
