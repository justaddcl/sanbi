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
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useUserQuery } from "@modules/users/api/queries";

type SongActionMenuProps = {
  /** ID of the specific set section song these actions related to */
  setSectionSongId: string;

  /** the ID of the set the set section song is attached to */
  setId: string;
};

export const SongActionMenu: React.FC<SongActionMenuProps> = ({
  setSectionSongId,
  setId,
}) => {
  const apiUtils = api.useUtils();
  const [isSongActionMenuOpen, setIsSongActionMenuOpen] =
    useState<boolean>(false);

  const {
    data: userData,
    error: userQueryError,
    isLoading: userQueryLoading,
    isAuthLoaded,
  } = useUserQuery();
  const userMembership = userData?.memberships[0];

  const deleteSetSectionSongMutation = api.setSectionSong.delete.useMutation();
  const removeSong = (organizationId: string, setSectionSongId: string) => {
    console.log("🤖 - SongActionMenu ~ removeSong");
    // TODO: add confirmation dialog for removing song

    deleteSetSectionSongMutation.mutate(
      { organizationId, setSectionSongId },
      {
        async onSuccess() {
          toast.success("Song removed");
          await apiUtils.set.get.invalidate({ setId });
        },
        onError(error) {
          toast.error(`Song could not be removed: ${error.message}`);
        },
      },
    );
  };

  if (
    !!userQueryError ||
    !isAuthLoaded ||
    userQueryLoading ||
    !userData ||
    !userMembership
  ) {
    return null;
  }

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
          onClick={() => {
            removeSong(userMembership?.organizationId, setSectionSongId);
          }}
          destructive
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
