"use client";

import { useCallback, useMemo, useState } from "react";
import { useDebounceValue } from "usehooks-ts";

import {
  type SearchToggleFilter,
  type TagSearchResult,
} from "@modules/search/components/types";
import { getGlobalSearchResultGroups } from "@modules/search/utils/getGlobalSearchResultGroups";
import {
  getVisibleGlobalSearchResults,
  GLOBAL_SEARCH_RESULT_COUNT_LIMIT,
  type SearchFilter,
} from "@modules/search/utils/getVisibleGlobalSearchResults";
import { trpc } from "@lib/trpc";

type UseSongSearchResultsInput = {
  organizationId?: string;
};

type SearchEscapeEvent = {
  preventDefault: () => void;
};

export const MIN_SONG_SEARCH_LENGTH = 2;
export const SONG_SEARCH_DEBOUNCE_DELAY = 300;

export const useSongSearchResults = ({
  organizationId,
}: UseSongSearchResultsInput) => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchInput, setDebouncedSearchInput] = useDebounceValue(
    searchInput,
    SONG_SEARCH_DEBOUNCE_DELAY,
  );
  const [selectedFilters, setSelectedFilters] = useState<
    Record<SearchToggleFilter, boolean>
  >({
    songs: false,
    tags: false,
  });

  const normalizedSearchInput = debouncedSearchInput.trim();
  const normalizedSearchQuery = normalizedSearchInput.toLowerCase();
  const hasSearchableInput =
    searchInput.trim().length >= MIN_SONG_SEARCH_LENGTH;
  const canSearch =
    !!organizationId &&
    normalizedSearchInput.length >= MIN_SONG_SEARCH_LENGTH;
  const isWaitingForDebounce =
    hasSearchableInput && searchInput.trim() !== normalizedSearchInput;
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

  const visibleTagCandidateResults: TagSearchResult[] = useMemo(() => {
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
  const escapeShortcutLabel = searchInput.trim().length > 0 ? "Clear" : "Close";

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

  const handleInputChange = useCallback(
    (newValue: string) => {
      setSearchInput(newValue);
    },
    [setSearchInput],
  );

  const clearSearchInput = useCallback(() => {
    setSearchInput("");
  }, []);

  const handleSearchEscapeKeyDown = useCallback(
    (event: SearchEscapeEvent) => {
      if (searchInput.trim().length === 0) {
        return false;
      }

      event.preventDefault();
      clearSearchInput();
      return true;
    },
    [clearSearchInput, searchInput],
  );

  const handleFilterToggle = useCallback((filter: SearchToggleFilter) => {
    setSelectedFilters((currentFilters) => ({
      ...currentFilters,
      [filter]: !currentFilters[filter],
    }));
  }, []);

  const resetSearchInput = useCallback(() => {
    setSearchInput("");
    setDebouncedSearchInput("");
    setSelectedFilters({ songs: false, tags: false });
  }, [setDebouncedSearchInput]);

  return {
    activeFilter,
    emptyResultsMessage,
    escapeShortcutLabel,
    clearSearchInput,
    handleFilterToggle,
    handleInputChange,
    handleSearchEscapeKeyDown,
    hasSearchResultOverflow,
    hasSearchableInput,
    isSearchError,
    normalizedSearchInput,
    resetSearchInput,
    searchInput,
    searchResultCountLabel,
    selectedFilters,
    shouldShowLoading,
    visibleResultCount,
    visibleSongResults,
    visibleTagResults,
  };
};
