import { MusicNoteSimple, Tag, X } from "@phosphor-icons/react/dist/ssr";

import { HStack } from "@components/HStack";
import { cn } from "@lib/utils";

import { searchFilters, type SearchToggleFilter } from "./types";

type SearchFilterControlsProps = {
  selectedFilters: Record<SearchToggleFilter, boolean>;
  onFilterToggle: (filter: SearchToggleFilter) => void;
};

export const SearchFilterControls = ({
  selectedFilters,
  onFilterToggle,
}: SearchFilterControlsProps) => (
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
        onClick={() => onFilterToggle(filter.value)}
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
);
