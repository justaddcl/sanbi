"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Command as CommandIcon,
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react/dist/ssr";

import { Button } from "@components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@components/ui/command";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { cn } from "@lib/utils";

type SearchProps = {
  className?: string;
};

const MIN_SEARCH_LENGTH = 2;

const SearchKeycap = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label?: string;
}) => (
  <kbd
    className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-slate-200 bg-slate-50 px-1.5 text-[11px] leading-none font-medium text-slate-500 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
    title={label}
  >
    {children}
    {label && <span className="sr-only">{label}</span>}
  </kbd>
);

export const Search: React.FC<SearchProps> = ({ className }) => {
  const searchDescriptionId = useId();
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const openRef = useRef(open);

  const normalizedSearchInput = searchInput.trim();
  const hasSearchableInput =
    normalizedSearchInput.length >= MIN_SEARCH_LENGTH;
  const closeOrClearLabel = searchInput ? "Clear search" : "Close search";

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || (!event.metaKey && !event.ctrlKey)) {
        return;
      }

      event.preventDefault();
      if (openRef.current) {
        setOpen(false);
        setSearchInput("");
        return;
      }

      setOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSearchInput("");
    }
  };

  const handleSearchControlClick = () => {
    if (normalizedSearchInput) {
      setSearchInput("");
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className={cn(
          "focus-visible:ring-ring flex h-10 w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-left transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden min-[1025px]:max-w-3xl",
          className,
        )}
        aria-label="Open global search"
        aria-describedby={searchDescriptionId}
        onClick={() => setOpen(true)}
      >
        <MagnifyingGlass aria-hidden size={16} className="text-slate-500" />
        <span className="min-w-0 flex-1 truncate text-sm text-slate-500">
          Search songs and tags
        </span>
        <HStack aria-hidden className="hidden items-center gap-1 sm:flex">
          <SearchKeycap label="Command">
            <CommandIcon aria-hidden size={15} />
          </SearchKeycap>
          <SearchKeycap>K</SearchKeycap>
        </HStack>
      </button>
      <span id={searchDescriptionId} className="sr-only">
        Opens the global search dialog. Search results will be added in a
        follow-up ticket.
      </span>

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
          if (!searchInput) {
            return;
          }

          event.preventDefault();
          setSearchInput("");
        }}
        className="max-h-[calc(100dvh_-_24px)] overflow-hidden !pb-0"
      >
        <HStack className="items-center border-b border-slate-100 [&_[cmdk-input-wrapper]]:border-b-0">
          <div className="min-w-0 flex-1">
            <CommandInput
              value={searchInput}
              onValueChange={setSearchInput}
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
            <X aria-hidden size={16} />
          </Button>
        </HStack>

        <CommandList className="max-h-[calc(100dvh_-_88px)] px-4 py-8">
          <CommandEmpty>
            <div className="mx-auto grid max-w-sm gap-1 text-center">
              <Text style="header-small-semibold">
                {hasSearchableInput ? "Ready to search" : "Start with a song or tag"}
              </Text>
              <Text style="body-small" className="text-slate-500">
                {hasSearchableInput
                  ? "Results will appear here once search is connected."
                  : "Type at least two characters to search your library."}
              </Text>
            </div>
          </CommandEmpty>
        </CommandList>
      </CommandDialog>
    </>
  );
};
