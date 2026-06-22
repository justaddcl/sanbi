import {
  CommandIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react/dist/ssr";

import { HStack } from "@components/HStack";
import { Keycap } from "@components/Keycap";
import { cn } from "@lib/utils";

type SearchTriggerProps = {
  className?: string;
  descriptionId: string;
  onOpen: () => void;
};

export const SearchTrigger = ({
  className,
  descriptionId,
  onOpen,
}: SearchTriggerProps) => (
  <>
    <button
      type="button"
      className={cn(
        "focus-visible:ring-ring flex h-10 w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-left transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden min-[1025px]:max-w-3xl",
        className,
      )}
      aria-label="Open global search"
      aria-describedby={descriptionId}
      onClick={onOpen}
    >
      <MagnifyingGlassIcon aria-hidden size={16} className="text-slate-500" />
      <span className="min-w-0 flex-1 truncate text-sm text-slate-500">
        Search songs and tags
      </span>
      <HStack aria-hidden className="hidden items-center gap-1 sm:flex">
        <Keycap label="Command">
          <CommandIcon aria-hidden size={15} />
        </Keycap>
        <Keycap>K</Keycap>
      </HStack>
    </button>
    <span id={descriptionId} className="sr-only">
      Opens the global search dialog for songs and tags.
    </span>
  </>
);
