import {
  ArrowSquareOutIcon,
  DotsThreeIcon,
  ListPlusIcon,
  PlusIcon,
} from "@phosphor-icons/react/dist/ssr";

import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";

import { type SearchSongResult } from "./types";

type SearchResultActionsProps = {
  canAddToCurrentSet: boolean;
  open: boolean;
  result: SearchSongResult;
  onAddToCurrentSet: (result: SearchSongResult) => void;
  onAddToSet: (result: SearchSongResult) => void;
  onActionSelect: () => void;
  onOpenChange: (open: boolean) => void;
  onOpenSong: (songId: string) => void;
};

export const SearchResultActions = ({
  canAddToCurrentSet,
  open,
  result,
  onAddToCurrentSet,
  onAddToSet,
  onActionSelect,
  onOpenChange,
  onOpenSong,
}: SearchResultActionsProps) => (
  <DropdownMenu open={open} onOpenChange={onOpenChange}>
    <DropdownMenuTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Open actions for ${result.name}`}
        title={`Open actions for ${result.name}`}
        className="ml-2 h-8 w-8 shrink-0 text-slate-500 hover:text-slate-900 data-[state=open]:bg-slate-100"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <DotsThreeIcon aria-hidden size={16} />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      side="bottom"
      className="min-w-52"
      data-search-result-actions-menu="true"
    >
      <DropdownMenuItem
        onSelect={() => {
          onActionSelect();
          onOpenSong(result.songId);
        }}
      >
        <ArrowSquareOutIcon aria-hidden size={16} className="mr-2" />
        Open song
        <DropdownMenuShortcut>Enter</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {canAddToCurrentSet && (
        <DropdownMenuItem
          onSelect={() => {
            onActionSelect();
            onAddToCurrentSet(result);
          }}
        >
          <ListPlusIcon aria-hidden size={16} className="mr-2" />
          Add to current set
        </DropdownMenuItem>
      )}
      <DropdownMenuItem
        onSelect={() => {
          onActionSelect();
          onAddToSet(result);
        }}
      >
        <PlusIcon aria-hidden size={16} className="mr-2" />
        Add to a set
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
