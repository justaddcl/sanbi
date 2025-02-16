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

type SongActionMenuProps = {
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

  /** is this song the first song of the section? */
  isFirstSong: SongItemWithActionsMenuProps["isFirstSong"];

  /** is this song the last song of the section? */
  isLastSong: SongItemWithActionsMenuProps["isLastSong"];
};

export const SongActionMenu: React.FC<SongActionMenuProps> = ({
  setSectionSong,
  setSectionType,
  setId,
  isFirstSong,
  isLastSong,
  isInFirstSection,
  isInLastSection,
}) => {
  const apiUtils = api.useUtils();
  const [isSongActionMenuOpen, setIsSongActionMenuOpen] =
    useState<boolean>(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
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

  const deleteSetSectionSongMutation = api.setSectionSong.delete.useMutation();
  const swapSongWithPreviousMutation =
    api.setSectionSong.swapSongWithPrevious.useMutation();
  const swapSongWithNextMutation =
    api.setSectionSong.swapSongWithNext.useMutation();
  const moveSongToAdjacentSectionMutation =
    api.setSectionSong.moveSongToPreviousSection.useMutation();

  if (
    !!userQueryError ||
    !isAuthLoaded ||
    userQueryLoading ||
    !userData ||
    !userMembership
  ) {
    return null;
  }

  const removeSong = () => {
    toast.loading("Removing song...");
    deleteSetSectionSongMutation.mutate(
      {
        organizationId: userMembership.organizationId,
        setSectionSongId: setSectionSong.id,
      },
      {
        async onSuccess() {
          toast.dismiss();
          toast.success("Song removed");
          await apiUtils.set.get.invalidate({ setId });
        },
        onError(error) {
          toast.dismiss();
          toast.error(`Song could not be removed: ${error.message}`);
        },
      },
    );
  };

  const moveSong = (direction: SwapSongDirection) => {
    toast.loading(`Moving song ${direction}...`);

    const moveSongMutation =
      direction === "up"
        ? swapSongWithPreviousMutation
        : swapSongWithNextMutation;

    moveSongMutation.mutate(
      {
        organizationId: userMembership.organizationId,
        setSectionSongId: setSectionSong.id,
      },
      {
        async onSuccess(swapSongWithNextResult) {
          toast.dismiss();

          if (!swapSongWithNextResult.success) {
            toast.error(
              `Could not move song ${direction}: ${swapSongWithNextResult.message}`,
            );
          } else {
            toast.success(`Moved song ${direction}`);
            await apiUtils.set.get.invalidate({ setId });
          }
        },
        onError(moveError) {
          toast.dismiss();
          toast.error(
            `Song could not be moved ${direction}: ${moveError.message}`,
          );
        },
      },
    );
  };

  const moveSongToAdjacentSection = (direction: MoveSectionDirection) => {
    toast.loading(`Moving song to the ${direction} section...`);
    moveSongToAdjacentSectionMutation.mutate(
      {
        organizationId: userMembership.organizationId,
        setSectionSongId: setSectionSong.id,
      },
      {
        async onSuccess() {
          toast.dismiss();
          toast.success(`Song moved to the ${direction} section`);
          await apiUtils.set.get.invalidate({ setId });
        },
        onError(moveError) {
          toast.dismiss();
          toast.error(
            `Song could not be moved to the ${direction} section: ${moveError.message}`,
          );
        },
      },
    );
  };

  const isOnlySong = isFirstSong && isLastSong;
  const isInOnlySection = isInFirstSection && isInLastSection;

  return (
    <>
      <DropdownMenu
        open={isSongActionMenuOpen}
        onOpenChange={setIsSongActionMenuOpen}
      >
        <DropdownMenuTrigger>
          <Button variant="ghost" size="sm">
            <DotsThree className="text-slate-900" size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent avoidCollisions align="end" side="bottom">
          <SongActionMenuItem
            icon="Article"
            label="View song details"
            onClick={() =>
              router.push(
                `/${params.organization}/songs/${setSectionSong.song.id}`,
              )
            }
          />
          <DropdownMenuSeparator />
          <SongActionMenuItem icon="PianoKeys" label="Change key" />
          <SongActionMenuItem icon="Swap" label="Replace song" />
          <DropdownMenuSeparator />
          {!isOnlySong && (
            <>
              <SongActionMenuItem
                icon="ArrowUp"
                label="Move up"
                disabled={isFirstSong}
                onClick={() => {
                  moveSong("up");
                  setIsSongActionMenuOpen(false);
                }}
              />
              <SongActionMenuItem
                icon="ArrowDown"
                label="Move down"
                disabled={isLastSong}
                onClick={() => {
                  moveSong("down");
                  setIsSongActionMenuOpen(false);
                }}
              />
            </>
          )}
          {!isInOnlySection && (
            <>
              <SongActionMenuItem
                icon="ArrowLineUp"
                label="Move to previous section"
                disabled={
                  isInFirstSection ||
                  moveSongToAdjacentSectionMutation.isPending
                }
                onClick={() => {
                  moveSongToAdjacentSection("previous");
                  setIsSongActionMenuOpen(false);
                }}
              />
              <SongActionMenuItem
                icon="ArrowLineDown"
                label="Move to next section"
                disabled={isInLastSection}
              />
            </>
          )}
          {!(isOnlySong && isInOnlySection) && <DropdownMenuSeparator />}
          <SongActionMenuItem
            icon="Trash"
            label="Remove from section"
            onClick={() => {
              setIsConfirmationDialogOpen(true);
              setIsSongActionMenuOpen(false);
            }}
            destructive
          />
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
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
      </AlertDialog>
    </>
  );
};
