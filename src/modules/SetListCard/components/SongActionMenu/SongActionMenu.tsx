"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog";
import { Button } from "@components/ui/button";
import { DropdownMenuSeparator } from "@components/ui/dropdown-menu";
import { ActionMenu, ActionMenuItem } from "@components/ActionMenu";
import { type SongItemWithActionsMenuProps } from "@modules/SetListCard/components/SongItem";
import { ReplaceSongDialog } from "@modules/songs/components/ReplaceSongDialog";
import { useUserQuery } from "@modules/users/api/queries";
import { trpc } from "@lib/trpc";
import { type SetSectionSongWithSongData } from "@lib/types";
import {
  type MoveSectionDirection,
  type SwapSongDirection,
} from "@server/mutations";

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

  /** call back to set if the song item is in edit mode */
  setIsEditingDetails: Dispatch<SetStateAction<boolean>>;
};

export const SongActionMenu: React.FC<SongActionMenuProps> = ({
  setSectionSong,
  setSectionType,
  setId,
  isFirstSong,
  isLastSong,
  isInFirstSection,
  isInLastSection,
  setIsEditingDetails,
}) => {
  const apiUtils = trpc.useUtils();
  const [isSongActionMenuOpen, setIsSongActionMenuOpen] =
    useState<boolean>(false);
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

  const deleteSetSectionSongMutation = trpc.setSectionSong.delete.useMutation();
  const swapSongWithPreviousMutation =
    trpc.setSectionSong.swapSongWithPrevious.useMutation();
  const swapSongWithNextMutation =
    trpc.setSectionSong.swapSongWithNext.useMutation();
  const moveSongToPreviousSectionMutation =
    trpc.setSectionSong.moveSongToPreviousSection.useMutation();
  const moveSongToNextSectionMutation =
    trpc.setSectionSong.moveSongToNextSection.useMutation();

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
        async onSuccess(moveSongResult) {
          toast.dismiss();

          if (!moveSongResult.success) {
            toast.error(
              `Could not move song ${direction}: ${moveSongResult.message}`,
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

    const moveSongToAdjacentSectionMutation =
      direction === "previous"
        ? moveSongToPreviousSectionMutation
        : moveSongToNextSectionMutation;

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
  const isMutationPending =
    swapSongWithPreviousMutation.isPending ||
    swapSongWithNextMutation.isPending ||
    moveSongToPreviousSectionMutation.isPending ||
    moveSongToNextSectionMutation.isPending ||
    deleteSetSectionSongMutation.isPending;

  return (
    <>
      <ActionMenu
        isOpen={isSongActionMenuOpen}
        setIsOpen={setIsSongActionMenuOpen}
        buttonVariant="ghost"
      >
        <ActionMenuItem
          icon="Article"
          label="View song details"
          onClick={() =>
            router.push(
              `/${params.organization}/songs/${setSectionSong.song.id}`,
            )
          }
        />
        <DropdownMenuSeparator />
        <ActionMenuItem
          icon="Pencil"
          label="Edit song"
          onClick={() => {
            setIsEditingDetails(true);
            setIsSongActionMenuOpen(false);
          }}
        />
        <ActionMenuItem
          icon="Swap"
          label="Replace song"
          disabled={isMutationPending}
          onClick={() => {
            setIsSongActionMenuOpen(false);
            setIsSongSearchDialogOpen(true);
          }}
        />
        <DropdownMenuSeparator />
        {!isOnlySong && (
          <>
            <ActionMenuItem
              icon="ArrowUp"
              label="Move up"
              disabled={isFirstSong || isMutationPending}
              onClick={() => {
                moveSong("up");
                setIsSongActionMenuOpen(false);
              }}
            />
            <ActionMenuItem
              icon="ArrowDown"
              label="Move down"
              disabled={isLastSong || isMutationPending}
              onClick={() => {
                moveSong("down");
                setIsSongActionMenuOpen(false);
              }}
            />
          </>
        )}
        {!isInOnlySection && (
          <>
            <ActionMenuItem
              icon="ArrowLineUp"
              label="Move to previous section"
              disabled={isInFirstSection || isMutationPending}
              onClick={() => {
                moveSongToAdjacentSection("previous");
                setIsSongActionMenuOpen(false);
              }}
            />
            <ActionMenuItem
              icon="ArrowLineDown"
              label="Move to next section"
              disabled={isInLastSection || isMutationPending}
              onClick={() => {
                moveSongToAdjacentSection("next");
                setIsSongActionMenuOpen(false);
              }}
            />
          </>
        )}
        {!(isOnlySong && isInOnlySection) && <DropdownMenuSeparator />}
        <ActionMenuItem
          icon="Trash"
          label="Remove from section"
          disabled={isMutationPending}
          onClick={() => {
            setIsConfirmationDialogOpen(true);
            setIsSongActionMenuOpen(false);
          }}
          destructive
        />
      </ActionMenu>
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
            <Button
              variant="destructive"
              onClick={() => {
                setIsConfirmationDialogOpen(false);
                removeSong();
              }}
            >
              Remove song
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ReplaceSongDialog
        open={isSongSearchDialogOpen}
        setOpen={setIsSongSearchDialogOpen}
        currentSong={setSectionSong}
        setId={setId}
      />
    </>
  );
};
