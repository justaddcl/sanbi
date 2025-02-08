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
        <SongActionMenuItem icon="Pencil">Edit song</SongActionMenuItem>
        <SongActionMenuItem icon="Swap">Replace song</SongActionMenuItem>
        <DropdownMenuSeparator />
        <SongActionMenuItem icon="ArrowUp" disabled>
          Move up
        </SongActionMenuItem>
        <SongActionMenuItem icon="ArrowDown">Move down</SongActionMenuItem>
        <SongActionMenuItem icon="ArrowLineUp" disabled>
          Move to previous section
        </SongActionMenuItem>
        <SongActionMenuItem icon="ArrowLineDown">
          Move to next section
        </SongActionMenuItem>
        <DropdownMenuSeparator />
        <SongActionMenuItem icon="Trash" destructive>
          Remove from section
        </SongActionMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
