"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowElbowDownLeftIcon,
  ArrowFatUpIcon,
  ArrowUp,
  CaretRight,
  ClockCounterClockwise,
  CommandIcon,
  MagnifyingGlass,
  MusicNoteSimple,
  Tag,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { CommandLoading } from "cmdk";
import { differenceInCalendarDays, differenceInCalendarWeeks } from "date-fns";
import { useDebounceValue } from "usehooks-ts";

import { Button } from "@components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@components/ui/command";
import { Skeleton } from "@components/ui/skeleton";
import { ActionMenu, ActionMenuItem } from "@components/ActionMenu";
import { HStack } from "@components/HStack";
import { SongKey } from "@components/SongKey";
import { Text } from "@components/Text";
import {
  getVisibleGlobalSearchResults,
  GLOBAL_SEARCH_RESULT_COUNT_LIMIT,
  type SearchFilter,
} from "@modules/search/utils/getVisibleGlobalSearchResults";
import { AddSongToSetDialog } from "@modules/songs/forms/AddSongToSet/components/AddSongToSetDialog";
import { useUserQuery } from "@modules/users/api/queries";
import { trpc } from "@lib/trpc";
import { type Song } from "@lib/types";
import { cn } from "@lib/utils";

type GlobalSearchProps = {
  className?: string;
};

type SearchSongResult = {
  songId: string;
  name: string;
  preferredKey: Song["preferredKey"];
  tags: string[] | null;
  lastPlayedDate: Date | null;
};

type TagSearchResult = {
  matchedTags: string[];
} & SearchSongResult;

const SEARCH_DEBOUNCE_DELAY = 300;
const MIN_SEARCH_LENGTH = 2;

type SearchToggleFilter = Exclude<SearchFilter, "all">;

const searchFilters: { label: string; value: SearchToggleFilter }[] = [
  { label: "Songs", value: "songs" },
  { label: "Tags", value: "tags" },
];

const SearchKeycap = ({
  children,
  label,
  variant = "plain",
}: {
  children: ReactNode;
  label?: string;
  variant?: "outline" | "plain";
}) => (
  <kbd
    className={cn(
      "inline-flex items-center justify-center leading-none font-medium text-slate-500",
      variant === "outline"
        ? "h-6 min-w-6 rounded border border-slate-200 bg-slate-50 px-1.5 text-[11px] shadow-[0_1px_0_rgba(15,23,42,0.04)]"
        : "min-w-3 text-[10px]",
    )}
    title={label}
  >
    {children}
    {label && <span className="sr-only">{label}</span>}
  </kbd>
);

const SearchShortcutHint = ({
  keys,
  label,
}: {
  keys: { content: ReactNode; label?: string }[];
  label: string;
}) => (
  <HStack className="items-center gap-1 text-[11px] leading-none text-slate-500">
    <HStack className="items-center gap-0.5">
      {keys.map((key, index) => (
        <SearchKeycap key={`${label}-${index}`} label={key.label}>
          {key.content}
        </SearchKeycap>
      ))}
    </HStack>
    <span>{label}</span>
  </HStack>
);

const shortcutIcons = {
  command: {
    content: <CommandIcon aria-hidden size={13} />,
    label: "Command",
  },
  enter: {
    content: <ArrowElbowDownLeftIcon aria-hidden size={13} />,
    label: "Enter",
  },
  shift: {
    content: <ArrowFatUpIcon aria-hidden size={12} />,
    label: "Shift",
  },
} as const;

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

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const HighlightedText = ({
  query,
  text,
}: {
  query: string;
  text: string;
}) => {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return text;
  }

  const segments = text.split(
    new RegExp(`(${escapeRegExp(normalizedQuery)})`, "gi"),
  );

  return (
    <>
      {segments.map((segment, index) =>
        segment.toLowerCase() === normalizedQuery.toLowerCase() ? (
          <mark
            key={`${segment}-${index}`}
            className="bg-transparent px-0 font-semibold text-slate-900"
          >
            {segment}
          </mark>
        ) : (
          <span key={`${segment}-${index}`}>{segment}</span>
        ),
      )}
    </>
  );
};

const SearchResultSkeletonRows = () => (
  <div className="grid gap-1 px-1">
    {Array.from({ length: 4 }).map((_, index) => (
      <HStack
        key={`search-result-skeleton-${index}`}
        className="items-start gap-3 rounded-md px-3 py-3"
      >
        <Skeleton className="mt-1 size-4 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <HStack className="items-center gap-2">
            <Skeleton className="h-4 w-44 max-w-[70%]" />
            <Skeleton className="h-5 w-6" />
          </HStack>
          <HStack className="items-center gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16" />
          </HStack>
        </div>
      </HStack>
    ))}
  </div>
);

const getLastPlayedContext = (lastPlayedDate: Date | null) => {
  if (!lastPlayedDate) {
    return "Never played";
  }

  const distanceFromLastPlayedInDays = differenceInCalendarDays(
    new Date(),
    lastPlayedDate,
  );
  const distanceFromLastPlayedInWeeks = differenceInCalendarWeeks(
    new Date(),
    lastPlayedDate,
  );

  if (distanceFromLastPlayedInWeeks > 0) {
    return `Last played ${distanceFromLastPlayedInWeeks}w ago`;
  }

  return `Last played ${distanceFromLastPlayedInDays}d ago`;
};

const getSongContext = (result: SearchSongResult) => {
  const tags = result.tags ?? [];
  const tagPreview = tags.slice(0, 2).join(", ");
  const hiddenTagCount = tags.length - 2;

  if (!tagPreview) {
    return getLastPlayedContext(result.lastPlayedDate);
  }

  const tagContext =
    hiddenTagCount > 0 ? `${tagPreview}, ${hiddenTagCount} more` : tagPreview;

  return `${getLastPlayedContext(result.lastPlayedDate)} · ${tagContext}`;
};

const getMatchedTagContext = (result: TagSearchResult) => {
  const matchedTagPreview = result.matchedTags.slice(0, 2).join(", ");
  const hiddenTagCount = result.matchedTags.length - 2;

  if (hiddenTagCount > 0) {
    return `${matchedTagPreview}, ${hiddenTagCount} more`;
  }

  return matchedTagPreview;
};

const SearchSongRow = ({
  query,
  result,
}: {
  query: string;
  result: SearchSongResult;
}) => (
  <div className="min-w-0 flex-1">
    <HStack className="w-fit max-w-full min-w-0 items-center gap-2">
      <Text
        style="header-small-semibold"
        className="min-w-0 truncate text-slate-500"
      >
        <HighlightedText query={query} text={result.name} />
      </Text>
      <SongKey size="medium" songKey={result.preferredKey} />
    </HStack>
    <HStack className="mt-1 min-w-0 items-center gap-1 text-xs text-slate-500">
      <ClockCounterClockwise aria-hidden size={12} className="shrink-0" />
      <span className="truncate">
        <HighlightedText query={query} text={getSongContext(result)} />
      </span>
    </HStack>
  </div>
);

const SearchTagMatchedSongRow = ({
  query,
  result,
}: {
  query: string;
  result: TagSearchResult;
}) => (
  <div className="min-w-0 flex-1">
    <HStack className="w-fit max-w-full min-w-0 items-center gap-2">
      <Text
        style="header-small-semibold"
        className="min-w-0 truncate text-slate-500"
      >
        <HighlightedText query={query} text={result.name} />
      </Text>
      <SongKey size="medium" songKey={result.preferredKey} />
    </HStack>
    <HStack className="mt-1 min-w-0 items-center gap-1 text-xs text-slate-500">
      <Tag aria-hidden className="!size-3 shrink-0" />
      <span className="min-w-0 truncate">
        <HighlightedText query={query} text={getMatchedTagContext(result)} />
      </span>
      <span aria-hidden className="shrink-0 text-slate-300">
        ·
      </span>
      <span className="shrink-0">
        {getLastPlayedContext(result.lastPlayedDate)}
      </span>
    </HStack>
  </div>
);

const getSelectedSearchItem = () => {
  const commandItems = document.querySelectorAll<HTMLElement>("[cmdk-item]");

  return Array.from(commandItems).find(
    (item) =>
      item.hasAttribute("data-selected") ||
      item.dataset.selected === "true" ||
      item.getAttribute("aria-selected") === "true",
  );
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ organization?: string; setId?: string }>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
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
  const [addToSetSongId, setAddToSetSongId] = useState<string | null>(null);
  const [actionsMenuSongId, setActionsMenuSongId] = useState<string | null>(
    null,
  );
  const [hasResultSelectionInteraction, setHasResultSelectionInteraction] =
    useState(false);

  const { userMembership } = useUserQuery();
  const organizationId = userMembership?.organizationId;
  const normalizedSearchInput = debouncedSearchInput.trim();
  const hasSearchableInput = searchInput.trim().length >= MIN_SEARCH_LENGTH;
  const canSearch =
    !!organizationId && normalizedSearchInput.length >= MIN_SEARCH_LENGTH;
  const activeFilter: SearchFilter = useMemo(() => {
    if (selectedFilters.songs === selectedFilters.tags) {
      return "all";
    }

    return selectedFilters.songs ? "songs" : "tags";
  }, [selectedFilters]);

  const { data: searchResults, isFetching: isSearchFetching } =
    trpc.song.search.useQuery(
      {
        organizationId: organizationId!,
        searchInput: normalizedSearchInput,
        limit: GLOBAL_SEARCH_RESULT_COUNT_LIMIT,
      },
      {
        enabled: canSearch,
      },
    );

  const { data: addToSetSong } = trpc.song.get.useQuery(
    {
      organizationId: organizationId!,
      songId: addToSetSongId!,
    },
    {
      enabled: !!organizationId && !!addToSetSongId,
    },
  );

  const songResults = useMemo(() => {
    if (!searchResults) {
      return [];
    }

    return searchResults.filter((result) =>
      result.name.toLowerCase().includes(normalizedSearchInput.toLowerCase()),
    );
  }, [normalizedSearchInput, searchResults]);

  const songResultIds = useMemo(
    () => new Set(songResults.map((result) => result.songId)),
    [songResults],
  );

  const tagResults = useMemo<TagSearchResult[]>(() => {
    if (!searchResults) {
      return [];
    }

    const matchingSongs = searchResults
      .map((result) => ({
        ...result,
        matchedTags:
          result.tags?.filter((tag) =>
            tag.toLowerCase().includes(normalizedSearchInput.toLowerCase()),
          ) ?? [],
      }))
      .filter((result) => result.matchedTags.length > 0);

    if (activeFilter !== "all") {
      return matchingSongs;
    }

    return matchingSongs.filter((result) => !songResultIds.has(result.songId));
  }, [activeFilter, normalizedSearchInput, searchResults, songResultIds]);

  const sortedTagResults = useMemo(
    () =>
      tagResults.map((result) => ({
        ...result,
        matchedTags: result.matchedTags.sort((firstTag, secondTag) =>
          firstTag.localeCompare(secondTag),
        ),
      })),
    [tagResults],
  );

  const {
    visibleSongResults,
    visibleTagResults: cappedVisibleTagResults,
    hasOverflow: hasSearchResultOverflow,
  } = useMemo(
    () =>
      getVisibleGlobalSearchResults({
        activeFilter,
        songResults,
        tagResults: sortedTagResults,
      }),
    [activeFilter, songResults, sortedTagResults],
  );
  const visibleResultCount =
    visibleSongResults.length + cappedVisibleTagResults.length;
  const totalResultCount =
    activeFilter === "songs"
      ? songResults.length
      : activeFilter === "tags"
        ? sortedTagResults.length
        : songResults.length + sortedTagResults.length;
  const searchResultCountLabel =
    searchResults && searchResults.length >= GLOBAL_SEARCH_RESULT_COUNT_LIMIT
      ? `${totalResultCount}+`
      : totalResultCount.toString();
  const shouldShowResultGroupHeadings = activeFilter === "all";

  const emptyResultsMessage = useMemo(() => {
    if (activeFilter === "songs") {
      return `No songs found for "${normalizedSearchInput}".`;
    }

    if (activeFilter === "tags") {
      return `No songs found with matching tags for "${normalizedSearchInput}".`;
    }

    return `No results found for "${normalizedSearchInput}".`;
  }, [activeFilter, normalizedSearchInput]);

  const hasSearchPageHref =
    !!organizationId && searchInput.trim().length >= MIN_SEARCH_LENGTH;
  const searchPageHref = useMemo(() => {
    if (!organizationId) {
      return undefined;
    }

    const searchParams = new URLSearchParams({
      q: searchInput.trim(),
    });

    if (activeFilter !== "all") {
      searchParams.set("filter", activeFilter);
    }

    return `/${organizationId}/search?${searchParams.toString()}`;
  }, [activeFilter, organizationId, searchInput]);
  const shouldShowSearchPageLink =
    hasSearchPageHref && hasSearchResultOverflow;
  const setPathMatch = /^\/[^/]+\/sets\/([^/?#]+)/.exec(pathname);
  const currentSetId = params.setId ?? setPathMatch?.[1];
  const isSetSearchContext = !!organizationId && !!currentSetId;

  const resetSearchInput = useCallback(() => {
    setSearchInput("");
    setDebouncedSearchInput("");
    setSelectedFilters({ songs: false, tags: false });
    setActionsMenuSongId(null);
    setHasResultSelectionInteraction(false);
  }, [setDebouncedSearchInput]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "k" ||
        (!event.metaKey && !event.ctrlKey)
      ) {
        return;
      }

      event.preventDefault();
      setOpen((currentOpen) => {
        if (currentOpen) {
          resetSearchInput();
        }

        return !currentOpen;
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetSearchInput]);
  const focusSearchInput = useCallback(() => {
    requestAnimationFrame(() => searchInputRef.current?.focus());
  }, []);

  const closeSearch = useCallback(() => {
    resetSearchInput();
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, [resetSearchInput]);

  const handleInputChange = (newValue: string) => {
    setSearchInput(newValue);
    setDebouncedSearchInput(newValue);
    setHasResultSelectionInteraction(false);
  };

  const clearSearchInput = () => handleInputChange("");

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetSearchInput();
      setActionsMenuSongId(null);
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscapeKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (actionsMenuSongId) {
        event.preventDefault();
        event.stopPropagation();
        setActionsMenuSongId(null);
        focusSearchInput();
        return;
      }

      if (searchInput.trim().length === 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setSearchInput("");
      setDebouncedSearchInput("");
    };

    document.addEventListener("keydown", handleEscapeKeyDown, true);

    return () =>
      document.removeEventListener("keydown", handleEscapeKeyDown, true);
  }, [
    actionsMenuSongId,
    focusSearchInput,
    open,
    searchInput,
    setDebouncedSearchInput,
  ]);

  const openSong = (songId: string) => {
    if (!organizationId) {
      return;
    }

    closeSearch();
    router.push(`/${organizationId}/songs/${songId}`);
  };

  const openAddSongToCurrentSet = useCallback(
    (songId: string) => {
      if (!organizationId || !currentSetId) {
        return;
      }

      closeSearch();
      router.push(
        `/${organizationId}/sets/${currentSetId}?addSongDialogOpen=1&songId=${songId}`,
      );
    },
    [closeSearch, currentSetId, organizationId, router],
  );

  const openAddSongToAnySet = useCallback(
    (songId: string) => {
      if (!organizationId) {
        return;
      }

      setAddToSetSongId(songId);
      closeSearch();
    },
    [closeSearch, organizationId],
  );

  const openSearchPage = useCallback(() => {
    if (!searchPageHref || !hasSearchPageHref) {
      return;
    }

    closeSearch();
    router.push(searchPageHref);
  }, [closeSearch, hasSearchPageHref, router, searchPageHref]);

  const handleSearchControlClick = () => {
    if (searchInput.trim().length > 0) {
      clearSearchInput();
      return;
    }

    closeSearch();
  };

  const searchControlLabel =
    searchInput.trim().length > 0 ? "Clear search" : "Close search";
  const escapeShortcutLabel = searchInput.trim().length > 0 ? "Clear" : "Close";
  const resultItemClassName = cn(
    "min-h-16 items-center rounded-md px-3 py-3 sm:min-h-0 sm:py-2.5",
    !hasResultSelectionInteraction &&
      "data-[selected='true']:bg-transparent data-[selected=true]:bg-transparent data-[selected=true]:text-slate-900",
  );

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
      onSelect={() => openSong(result.songId)}
      onPointerEnter={() => setHasResultSelectionInteraction(true)}
    >
      {row}
      <div
        className="ml-auto shrink-0"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <ActionMenu
          isOpen={actionsMenuSongId === result.songId}
          setIsOpen={(nextOpen) => {
            const resolvedOpen =
              typeof nextOpen === "function"
                ? nextOpen(actionsMenuSongId === result.songId)
                : nextOpen;
            setActionsMenuSongId(resolvedOpen ? result.songId : null);
          }}
          triggerLabel={`Actions for ${result.name}`}
          buttonVariant="ghost"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            focusSearchInput();
          }}
        >
          <ActionMenuItem
            icon="Article"
            label="See song details"
            onClick={() => openSong(result.songId)}
          />
          {isSetSearchContext && (
            <ActionMenuItem
              icon="Plus"
              label="Add to this set"
              onClick={() => openAddSongToCurrentSet(result.songId)}
            />
          )}
          <ActionMenuItem
            icon="Plus"
            label="Add to a set"
            onClick={() => openAddSongToAnySet(result.songId)}
          />
        </ActionMenu>
      </div>
    </CommandItem>
  );

  useEffect(() => {
    if (!open || !isSetSearchContext) {
      return;
    }

    const handleAddToCurrentSetShortcut = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || (!event.metaKey && !event.ctrlKey)) {
        return;
      }

      const selectedItem = getSelectedSearchItem();
      const selectedSongId =
        selectedItem instanceof HTMLElement
          ? selectedItem.dataset.songId
          : undefined;

      if (!selectedSongId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      openAddSongToCurrentSet(selectedSongId);
    };

    document.addEventListener("keydown", handleAddToCurrentSetShortcut, true);

    return () =>
      document.removeEventListener(
        "keydown",
        handleAddToCurrentSetShortcut,
        true,
      );
  }, [isSetSearchContext, open, openAddSongToCurrentSet]);

  useEffect(() => {
    if (!open || isSetSearchContext) {
      return;
    }

    const handleAddToAnySetShortcut = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || (!event.metaKey && !event.ctrlKey)) {
        return;
      }

      const selectedItem = getSelectedSearchItem();
      const selectedSongId =
        selectedItem instanceof HTMLElement
          ? selectedItem.dataset.songId
          : undefined;

      if (!selectedSongId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      openAddSongToAnySet(selectedSongId);
    };

    document.addEventListener("keydown", handleAddToAnySetShortcut, true);

    return () =>
      document.removeEventListener("keydown", handleAddToAnySetShortcut, true);
  }, [isSetSearchContext, open, openAddSongToAnySet]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleDefaultEnterKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== "Enter" ||
        event.shiftKey ||
        event.metaKey ||
        event.ctrlKey ||
        actionsMenuSongId ||
        hasResultSelectionInteraction
      ) {
        return;
      }

      if (!shouldShowSearchPageLink) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      openSearchPage();
    };

    document.addEventListener("keydown", handleDefaultEnterKeyDown, true);

    return () =>
      document.removeEventListener("keydown", handleDefaultEnterKeyDown, true);
  }, [
    actionsMenuSongId,
    hasResultSelectionInteraction,
    open,
    openSearchPage,
    shouldShowSearchPageLink,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleResultNavigationKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
        return;
      }

      setHasResultSelectionInteraction(true);
    };

    document.addEventListener("keydown", handleResultNavigationKeyDown, true);

    return () =>
      document.removeEventListener(
        "keydown",
        handleResultNavigationKeyDown,
        true,
      );
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleOpenActionsShortcut = (event: KeyboardEvent) => {
      if (
        event.key !== "Enter" ||
        !event.shiftKey ||
        event.metaKey ||
        event.ctrlKey
      ) {
        return;
      }

      const selectedItem = getSelectedSearchItem();
      const selectedSongId =
        selectedItem instanceof HTMLElement
          ? selectedItem.dataset.songId
          : undefined;

      if (!selectedSongId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setActionsMenuSongId(selectedSongId);
    };

    document.addEventListener("keydown", handleOpenActionsShortcut, true);

    return () =>
      document.removeEventListener("keydown", handleOpenActionsShortcut, true);
  }, [open]);

  return (
    <>

      <button
        ref={triggerRef}
        type="button"
        className={cn(
          "focus-visible:ring-ring flex h-10 w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-left transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden min-[1025px]:max-w-3xl",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        <MagnifyingGlass aria-hidden size={16} className="text-slate-500" />

        <span className="min-w-0 flex-1 truncate text-sm text-slate-500">
          Search songs and tags
        </span>

        <HStack aria-hidden className="hidden items-center gap-1 sm:flex">
          <SearchKeycap label="Command" variant="outline">
            <CommandIcon aria-hidden size={15} />
          </SearchKeycap>
          <SearchKeycap variant="outline">K</SearchKeycap>
        </HStack>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        dialogTitle="Search Sanbi"
        fixed
        minimalPadding
        shouldFilter={false}
        autoFocusInput={open}
        className={cn(
          "max-h-[calc(100dvh_-_24px)] overflow-hidden !pb-0",
          hasSearchableInput && "sm:!pb-3",
        )}
        onEscapeKeyDown={(event) => {
          if (searchInput.trim().length === 0) {
            return;
          }

          event.preventDefault();
        }}
        closeButton={null}
      >
        <div className={cn(hasSearchableInput && "border-b border-slate-100")}>
          <HStack className="items-center border-b border-slate-100 [&_[cmdk-input-wrapper]]:border-b-0">
            <div className="min-w-0 flex-1">
              <CommandInput
                ref={searchInputRef}
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
              aria-label={searchControlLabel}
              title={searchControlLabel}
              onClick={handleSearchControlClick}
            >
              <X aria-hidden size={16} />
            </Button>
          </HStack>
          <HStack
            className="flex-wrap items-center gap-1.5 px-3 py-2 sm:px-4"
            role="group"
            aria-label="Search filter"
          >
            {searchFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={cn(
                  "focus-visible:ring-ring inline-flex min-h-8 min-w-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden",
                  selectedFilters[filter.value]
                    ? "border-slate-200 bg-slate-100 text-slate-900"
                    : "border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
                aria-pressed={selectedFilters[filter.value]}
                onClick={() => {
                  setSelectedFilters((currentFilters) => ({
                    ...currentFilters,
                    [filter.value]: !currentFilters[filter.value],
                  }));
                  setHasResultSelectionInteraction(false);
                }}
              >
                {filter.value === "songs" && (
                  <MusicNoteSimple aria-hidden size={12} className="shrink-0" />
                )}
                {filter.value === "tags" && (
                  <Tag aria-hidden size={12} className="shrink-0" />
                )}
                <span className="truncate">{filter.label}</span>
                {selectedFilters[filter.value] && (
                  <X aria-hidden size={11} className="ml-0.5 shrink-0" />
                )}
              </button>
            ))}
          </HStack>
        </div>
        {hasSearchableInput && (
          <CommandList className="max-h-[calc(100dvh_-_132px)] px-2 py-2 sm:max-h-[min(520px,calc(100dvh_-_180px))]">
            {isSearchFetching && (
              <CommandLoading>
                <SearchResultSkeletonRows />
              </CommandLoading>
            )}
            {canSearch && !isSearchFetching && visibleResultCount === 0 && (
              <CommandEmpty>{emptyResultsMessage}</CommandEmpty>
            )}
            {!isSearchFetching && shouldShowSearchPageLink && (
              <div className="px-1 pb-2">
                <CommandItem
                  value="see-all-results"
                  className={cn(
                    "rounded-md px-3 py-2.5 text-slate-700 data-[selected='true']:bg-slate-100",
                    !hasResultSelectionInteraction &&
                      "data-[selected='true']:bg-transparent data-[selected=true]:bg-transparent data-[selected=true]:text-slate-700",
                  )}
                  onSelect={openSearchPage}
                  onPointerEnter={() => setHasResultSelectionInteraction(true)}
                >
                  <MagnifyingGlass
                    aria-hidden
                    size={15}
                    className="text-slate-400"
                  />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    See all results for &quot;{searchInput.trim()}&quot;
                  </span>
                  <CaretRight aria-hidden size={14} className="text-slate-400" />
                </CommandItem>
              </div>
            )}
            {!isSearchFetching && visibleResultCount > 0 && (
              <HStack className="items-center justify-between px-3 pt-1 pb-2 text-[11px] font-medium text-slate-500">
                <span>Search results ({searchResultCountLabel})</span>
              </HStack>
            )}
            {!isSearchFetching && visibleSongResults.length > 0 && (
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
                  {visibleSongResults.map((result) => (
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
                    })
                  ))}
                </div>
              </CommandGroup>
            )}
            {!isSearchFetching && cappedVisibleTagResults.length > 0 && (
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
                  {cappedVisibleTagResults.map((result) => (
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
                    })
                  ))}
                </div>
              </CommandGroup>
            )}
          </CommandList>
        )}
        {hasSearchableInput && (
          <HStack className="hidden items-center justify-between gap-4 border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500 sm:flex">
            <HStack className="items-center gap-4 min-[1100px]:gap-5">
              <SearchShortcutHint
                keys={[
                  {
                    content: <ArrowUp aria-hidden size={12} />,
                    label: "Arrow up",
                  },
                  {
                    content: <ArrowDown aria-hidden size={12} />,
                    label: "Arrow down",
                  },
                ]}
                label="Navigate"
              />
              <SearchShortcutHint keys={[shortcutIcons.enter]} label="Open" />
              <SearchShortcutHint
                keys={[shortcutIcons.shift, shortcutIcons.enter]}
                label="Actions"
              />
            </HStack>
            <HStack className="items-center gap-4 min-[1100px]:gap-5">
              {isSetSearchContext && (
                <SearchShortcutHint
                  keys={[shortcutIcons.command, shortcutIcons.enter]}
                  label="Add to this set"
                />
              )}
              {!isSetSearchContext && (
                <SearchShortcutHint
                  keys={[shortcutIcons.command, shortcutIcons.enter]}
                  label="Add to a set"
                />
              )}
              <SearchShortcutHint
                keys={[{ content: "Esc" }]}
                label={escapeShortcutLabel}
              />
            </HStack>
          </HStack>
        )}
      </CommandDialog>
      {addToSetSong && (
        <AddSongToSetDialog
          song={addToSetSong}
          open={!!addToSetSongId}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setAddToSetSongId(null);
            }
          }}
          trigger={null}
        />
      )}
    </>
  );
};
