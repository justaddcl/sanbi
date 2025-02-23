"use client";

import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { type Dispatch, type SetStateAction, useState } from "react";
import { DotsThree } from "@phosphor-icons/react";
import { SongActionMenuItem } from "@modules/SetListCard/components/SongActionMenuItem";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useUserQuery } from "@modules/users/api/queries";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog";
import { type SetSectionSongWithSongData } from "@lib/types";
import { type SongItemWithActionsMenuProps } from "@modules/SetListCard/components/SongItem";
import {
  type MoveSectionDirection,
  type SwapSongDirection,
} from "@server/mutations";
import { useParams, useRouter } from "next/navigation";
import { ReplaceSongDialog } from "@modules/songs/components/ReplaceSongDialog";

type SetSectionActionMenuProps = {
  /** set section song object */
  setSectionSong: SetSectionSongWithSongData;

  /** the type of set section this song is attached to */
  setSectionType: string;

  /** the ID of the set the set section song is attached to */
  setId: string;

  /** is this song in the first section of the set? */
  isInFirstSection: SongItemWithActionsMenuProps["isInFirstSection"];

  /** is this song in the last section of the set? */
  isInLastSection: SongItemWithActionsMenuProps["isInLastSection"];

  /** call back to set if the song item is in edit mode */
  setIsEditingDetails: Dispatch<SetStateAction<boolean>>;
};

export const SetSectionActionMenu: React.FC<SetSectionActionMenuProps> = ({
  // setSectionSong,
  // setSectionType,
  // setId,
  isInFirstSection,
  isInLastSection,
  // setIsEditingDetails,
}) => {
  const apiUtils = api.useUtils();
  const [isActionMenuOpen, setIsActionMenuOpen] = useState<boolean>(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState<boolean>(false);
  const [isSongSearchDialogOpen, setIsSongSearchDialogOpen] =
    useState<boolean>(false);

  const params = useParams<{ organization: string }>();
  const router = useRouter();

  const {
    data: userData,
    error: userQueryError,
    isLoading: userQueryLoading,
    isAuthLoaded,
  } = useUserQuery();
  const userMembership = userData?.memberships[0];

  if (
    !!userQueryError ||
    !isAuthLoaded ||
    userQueryLoading ||
    !userData ||
    !userMembership
  ) {
    return null;
  }

  const isInOnlySection = isInFirstSection && isInLastSection;

  return (
    <>
      <DropdownMenu open={isActionMenuOpen} onOpenChange={setIsActionMenuOpen}>
        <DropdownMenuTrigger>
          <Button variant="ghost" size="sm">
            <DotsThree className="text-slate-900" size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent avoidCollisions align="end" side="bottom">
          <SongActionMenuItem icon="Swap" label="Change section type" />
          <DropdownMenuSeparator />
          {!isInOnlySection && (
            <>
              <SongActionMenuItem
                icon="ArrowLineUp"
                label="Move section to top"
                disabled={isInFirstSection}
              />
              <SongActionMenuItem icon="ArrowUp" label="Move section up" />
              <SongActionMenuItem icon="ArrowDown" label="Move section down" />
              <SongActionMenuItem
                icon="ArrowLineDown"
                label="Move section to bottom"
                disabled={isInLastSection}
              />
              <DropdownMenuSeparator />
            </>
          )}
          <SongActionMenuItem icon="Trash" label="Delete section" destructive />
        </DropdownMenuContent>
      </DropdownMenu>
      {/* <AlertDialog
        open={isConfirmationDialogOpen}
        onOpenChange={setIsConfirmationDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Remove &quot;{setSectionSong.song.name}&quot; from the{" "}
              {setSectionType} section?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsConfirmationDialogOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <Button variant="destructive" onClick={() => removeSong()}>
              Remove song
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
      {/* <ReplaceSongDialog
        open={isSongSearchDialogOpen}
        setOpen={setIsSongSearchDialogOpen}
        currentSong={setSectionSong}
        setId={setId}
      /> */}
    </>
  );
};
