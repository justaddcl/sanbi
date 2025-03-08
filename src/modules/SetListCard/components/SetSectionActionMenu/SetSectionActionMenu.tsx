"use client";

import { DropdownMenuSeparator } from "@components/ui/dropdown-menu";
import { type Dispatch, type SetStateAction, useState } from "react";
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
import { useParams, useRouter } from "next/navigation";
import { ActionMenu, ActionMenuItem } from "@components/ActionMenu";
import { type SetSectionCardProps } from "@modules/sets/components/SetSectionCard";
import { type SwapSetSectionPositionDirection } from "@modules/setSections/api/mutations";

type SetSectionActionMenuProps = {
  /** set section the action menu is attached to */
  setSection: SetSectionCardProps["section"];

  /** how many set sections are in the set this section is attached to */
  setSectionsLength: SetSectionCardProps["setSectionsLength"];

  /** the type of set section this song is attached to */
  // setSectionType: string;

  /** the ID of the set the set section song is attached to */
  // setId: string;

  /** is this song in the first section of the set? */
  isInFirstSection: SongItemWithActionsMenuProps["isInFirstSection"];

  /** is this song in the last section of the set? */
  isInLastSection: SongItemWithActionsMenuProps["isInLastSection"];

  /** call back to set if the song item is in edit mode */
  setIsEditingSectionType: Dispatch<SetStateAction<boolean>>;
};

export const SetSectionActionMenu: React.FC<SetSectionActionMenuProps> = ({
  setSection,
  setSectionsLength,
  // setSectionSong,
  // setSectionType,
  // setId,
  isInFirstSection,
  isInLastSection,
  setIsEditingSectionType,
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

  const swapSetSectionWithPreviousMutation =
    api.setSection.swapSectionWithPrevious.useMutation();
  const swapSetSectionWithNextMutation =
    api.setSection.swapSectionWithNext.useMutation();
  const moveSetSectionToFirstMutation =
    api.setSection.moveSectionToFirst.useMutation();
  const moveSetSectionToLastMutation =
    api.setSection.moveSectionToLast.useMutation();

  if (
    !!userQueryError ||
    !isAuthLoaded ||
    userQueryLoading ||
    !userData ||
    !userMembership
  ) {
    return null;
  }

  const moveSection = (direction: SwapSetSectionPositionDirection) => {
    toast.loading(`Moving section ${direction}`);

    const moveSectionMutation = (() => {
      switch (direction) {
        case "up":
          return swapSetSectionWithPreviousMutation;
        case "down":
          return swapSetSectionWithNextMutation;
        case "first":
          return moveSetSectionToFirstMutation;
        case "last":
          return moveSetSectionToLastMutation;
        default:
          const _exhaustiveCheck: never = direction;
          return _exhaustiveCheck;
      }
    })();

    moveSectionMutation.mutate(
      {
        organizationId: userMembership.organizationId,
        setSectionId: setSection.id,
      },
      {
        async onSuccess(swapSetSectionResult) {
          toast.dismiss();

          const isSwapUpdate = direction === "up" || direction === "down";

          if (!swapSetSectionResult.success) {
            isSwapUpdate
              ? toast.error(
                  `Could not move section ${direction}: ${swapSetSectionResult.message}`,
                )
              : toast.error(
                  `Could not move section to the ${direction} position: ${swapSetSectionResult.message}`,
                );
          } else {
            isSwapUpdate
              ? toast.success(`Moved section ${direction}`)
              : toast.success(`Moved section to the ${direction} position`);
            await apiUtils.set.get.invalidate({
              organizationId: userMembership.organizationId,
              setId: setSection.setId,
            });
          }
        },
        async onError(swapError) {
          toast.dismiss();

          const isSwapUpdate = direction === "up" || direction === "down";

          isSwapUpdate
            ? toast.error(
                `Could not move section ${direction}: ${swapError.message}`,
              )
            : toast.error(
                `Could not move section to the ${direction} position: ${swapError.message}`,
              );
        },
      },
    );
  };

  const isInOnlySection = isInFirstSection && isInLastSection;

  return (
    <>
      <ActionMenu isOpen={isActionMenuOpen} setIsOpen={setIsActionMenuOpen}>
        <ActionMenuItem
          icon="Swap"
          label="Change section type"
          onClick={() => setIsEditingSectionType(true)}
        />
        <DropdownMenuSeparator />
        {!isInOnlySection && (
          <>
            {setSection.position > 1 && (
              <ActionMenuItem
                icon="ArrowLineUp"
                label="Move section to top"
                disabled={isInFirstSection}
                onClick={() => {
                  moveSection("first");
                  setIsActionMenuOpen(false);
                }}
              />
            )}
            <ActionMenuItem
              icon="ArrowUp"
              label="Move section up"
              disabled={isInFirstSection}
              onClick={() => {
                moveSection("up");
                setIsActionMenuOpen(false);
              }}
            />
            <ActionMenuItem
              icon="ArrowDown"
              label="Move section down"
              disabled={isInLastSection}
              onClick={() => {
                moveSection("down");
                setIsActionMenuOpen(false);
              }}
            />
            {setSection.position < setSectionsLength - 2 && (
              <ActionMenuItem
                icon="ArrowLineDown"
                label="Move section to bottom"
                disabled={isInLastSection}
                onClick={() => {
                  moveSection("last");
                  setIsActionMenuOpen(false);
                }}
              />
            )}
            <DropdownMenuSeparator />
          </>
        )}
        <ActionMenuItem icon="Trash" label="Delete section" destructive />
      </ActionMenu>
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
