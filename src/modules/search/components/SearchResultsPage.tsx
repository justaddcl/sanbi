"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MagnifyingGlass,
  MusicNoteSimple,
  Tag,
} from "@phosphor-icons/react/dist/ssr";
import { useDebounceValue } from "usehooks-ts";

import { buttonVariants } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Skeleton } from "@components/ui/skeleton";
import { HStack } from "@components/HStack";
import { PageTitle } from "@components/PageTitle";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { SongListItem } from "@modules/songs/components/SongListItem";
import { trpc } from "@lib/trpc";
import { cn } from "@lib/utils";

type SearchResultsPageProps = {
  organizationId: string;
  initialQuery: string;
  initialFilter?: SearchFilter;
};

type SearchFilter = "all" | "songs" | "tags";

const SEARCH_DEBOUNCE_DELAY = 300;
const MIN_SEARCH_LENGTH = 2;

const searchFilters: { label: string; value: SearchFilter }[] = [
  { label: "All", value: "all" },
  { label: "Songs", value: "songs" },
  { label: "Tags", value: "tags" },
];

const SearchResultSkeletonRows = () => (
  <>
    {Array.from({ length: 4 }).map((_, index) => (
      <HStack
        key={`search-result-page-skeleton-${index}`}
        className="items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3"
      >
        <Skeleton className="mt-1 size-8 shrink-0" />
        <div className="min-w-0 flex-1 space-y-3">
          <HStack className="items-center gap-2">
            <Skeleton className="h-4 w-56 max-w-[75%]" />
            <Skeleton className="h-5 w-6" />
          </HStack>
          <HStack className="items-center gap-3">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </HStack>
        </div>
      </HStack>
    ))}
  </>
);

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  organizationId,
  initialQuery,
  initialFilter = "all",
}) => {
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [debouncedSearchInput, setDebouncedSearchInput] = useDebounceValue(
    initialQuery,
    SEARCH_DEBOUNCE_DELAY,
  );
  const [activeFilter, setActiveFilter] = useState<SearchFilter>(initialFilter);

  const normalizedSearchInput = debouncedSearchInput.trim();
  const canSearch = normalizedSearchInput.length >= MIN_SEARCH_LENGTH;

  const { data: searchResults, isFetching: isSearchFetching } =
    trpc.song.search.useQuery(
      {
        organizationId,
        searchInput: normalizedSearchInput,
      },
      {
        enabled: canSearch,
      },
    );

  const visibleResults = useMemo(() => {
    if (!searchResults) {
      return [];
    }

    if (activeFilter === "songs") {
      return searchResults.filter((result) =>
        result.name.toLowerCase().includes(normalizedSearchInput.toLowerCase()),
      );
    }

    if (activeFilter === "tags") {
      return searchResults.filter((result) =>
        result.tags?.some((tag) =>
          tag.toLowerCase().includes(normalizedSearchInput.toLowerCase()),
        ),
      );
    }

    return searchResults;
  }, [activeFilter, normalizedSearchInput, searchResults]);

  const handleSearchInputChange = (
    changeEvent: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchInput(changeEvent.target.value);
    setDebouncedSearchInput(changeEvent.target.value);
  };

  return (
    <VStack className="gap-6">
      <PageTitle
        title="Search"
        subtitle="Find songs by title or tag"
        details={
          canSearch && !isSearchFetching
            ? `${visibleResults.length} ${visibleResults.length === 1 ? "result" : "results"}`
            : undefined
        }
      />
      <VStack className="gap-3">
        <label className="sr-only" htmlFor="global-search-results-input">
          Search songs and tags
        </label>
        <HStack className="focus-within:ring-ring items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 focus-within:ring-2 focus-within:ring-offset-2">
          <MagnifyingGlass aria-hidden size={16} className="text-slate-500" />
          <Input
            id="global-search-results-input"
            value={searchInput}
            onChange={handleSearchInputChange}
            placeholder="Search songs or tags"
            className="border-0 px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </HStack>
        <HStack className="gap-2 overflow-x-auto">
          {searchFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={cn(
                "focus-visible:ring-ring rounded-md border px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden",
                activeFilter === filter.value
                  ? "border-slate-200 bg-slate-100 text-slate-900"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
              aria-pressed={activeFilter === filter.value}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </HStack>
      </VStack>
      <VStack className="gap-2">
        {searchInput.trim().length < MIN_SEARCH_LENGTH && (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <Text style="header-small-semibold">Start with a song or tag</Text>
            <Text style="body-small" className="mt-1 text-slate-500">
              Type at least two characters to search your library.
            </Text>
          </div>
        )}
        {isSearchFetching && <SearchResultSkeletonRows />}
        {canSearch && !isSearchFetching && visibleResults.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <Text style="header-small-semibold">No results found</Text>
            <Text style="body-small" className="mt-1 text-slate-500">
              Try another song title or tag.
            </Text>
          </div>
        )}
        {!isSearchFetching &&
          visibleResults.map((result) => {
            const matchedTag = result.tags?.find((tag) =>
              tag.toLowerCase().includes(normalizedSearchInput.toLowerCase()),
            );

            return (
              <Link
                key={result.songId}
                href={`/${organizationId}/songs/${result.songId}`}
                className="focus-visible:ring-ring rounded-lg border border-slate-200 bg-white px-4 py-3 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
              >
                <HStack className="items-start gap-3">
                  <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-500">
                    <MusicNoteSimple aria-hidden size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <SongListItem
                      song={{ id: result.songId, ...result }}
                      lastPlayed={result.lastPlayedDate}
                      tags={result.tags}
                    />
                    {matchedTag && (
                      <HStack className="mt-2 items-center gap-1 text-xs text-slate-500">
                        <Tag aria-hidden size={12} />
                        <span>Matched tag: {matchedTag}</span>
                      </HStack>
                    )}
                  </div>
                </HStack>
              </Link>
            );
          })}
      </VStack>
      {visibleResults.length > 0 && (
        <Link
          href={`/${organizationId}`}
          className={cn(buttonVariants({ variant: "outline" }), "self-start")}
        >
          Back to dashboard
        </Link>
      )}
    </VStack>
  );
};
