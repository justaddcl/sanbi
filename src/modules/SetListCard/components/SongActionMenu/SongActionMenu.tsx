"use client";

import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { useState } from "react";
import { DotsThree } from "@phosphor-icons/react";
import { SongActionMenuItem } from "@modules/SetListCard/components/SongActionMenuItem";

export const SongActionMenu: React.FC = () => {
  const [isSongActionMenuOpen, setIsSongActionMenuOpen] =
    useState<boolean>(false);
  return (
    <DropdownMenu
      open={isSongActionMenuOpen}
      onOpenChange={setIsSongActionMenuOpen}
    >
      <DropdownMenuTrigger>
        <Button variant="ghost" size="sm">
          <DotsThree className="text-slate-900" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <SongActionMenuItem icon="PianoKeys" label="Change key" />
        <SongActionMenuItem icon="Swap" label="Replace song" />
        <DropdownMenuSeparator />
        <SongActionMenuItem icon="ArrowUp" label="Move up" />
        <SongActionMenuItem icon="ArrowDown" label="Move down" />
        <SongActionMenuItem
          icon="ArrowLineUp"
          label="Move to previous section"
        />
        <SongActionMenuItem icon="ArrowLineDown" label="Move to next section" />
        <DropdownMenuSeparator />
        <SongActionMenuItem
          icon="Trash"
          label="Remove from section"
          destructive
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
