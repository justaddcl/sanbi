"use client";

import { CommandInput } from "@components/ui/command";
import { SearchFilterControls } from "@modules/search/components/SearchFilterControls";
import {
  type SearchResultMatchType,
  SearchResultsList,
} from "@modules/search/components/SearchResultsList";
import { type SearchSongResult } from "@modules/search/components/types";
import { useSongSearchResults } from "@modules/search/hooks/useSongSearchResults";

export type SongSearchMatchType = SearchResultMatchType;

export type SongSearchResult = SearchSongResult;

type SongSearchProps = {
  organizationId?: string;
  onSongSelect?: (
    selectedSong: SongSearchResult,
    matchType: SongSearchMatchType,
  ) => void;
  searchPlaceholder?: string;
};

export const SongSearch: React.FC<SongSearchProps> = ({
  organizationId,
  onSongSelect,
  searchPlaceholder = "Search songs or tags",
}) => {
  const {
    activeFilter,
    emptyResultsMessage,
    handleFilterToggle,
    handleInputChange,
    hasSearchResultOverflow,
    hasSearchableInput,
    isSearchError,
    normalizedSearchInput,
    searchInput,
    searchResultCountLabel,
    selectedFilters,
    shouldShowLoading,
    visibleResultCount,
    visibleSongResults,
    visibleTagResults,
  } = useSongSearchResults({ organizationId });

  return (
    <>
      <div className={hasSearchableInput ? "border-b border-slate-100" : ""}>
        <CommandInput
          value={searchInput}
          onValueChange={handleInputChange}
          placeholder={searchPlaceholder}
          className="h-14 text-base md:text-base"
        />
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
          onSongSelect={(result, matchType) =>
            onSongSelect?.(result, matchType)
          }
          resultCountLabel={searchResultCountLabel}
          visibleResultCount={visibleResultCount}
          visibleSongResults={visibleSongResults}
          visibleTagResults={visibleTagResults}
        />
      )}
    </>
  );
};
