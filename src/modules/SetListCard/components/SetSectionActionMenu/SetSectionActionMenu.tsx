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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog";
import { type SongItemWithActionsMenuProps } from "@modules/SetListCard/components/SongItem";
import { useParams, useRouter } from "next/navigation";
import { ActionMenu, ActionMenuItem } from "@components/ActionMenu";
import { type SetSectionCardProps } from "@modules/sets/components/SetSectionCard";
import { type SwapSetSectionPositionDirection } from "@modules/setSections/api/mutations";
import { Button } from "@components/ui/button";
import { VStack } from "@components/VStack";
import { Text } from "@components/Text";

type SetSectionActionMenuProps = {
  /** set section the action menu is attached to */
  setSection: SetSectionCardProps["section"];

  /** how many set sections are in the set this section is attached to */
  setSectionsLength: SetSectionCardProps["setSectionsLength"];

  /** the type of set section this song is attached to */
  // setSectionType: string;

  /** the ID of the set the set section song is attached to */
  // setId: string;

  /** is this the first section of the set? */
  isInFirstSection: SongItemWithActionsMenuProps["isInFirstSection"];

  /** is this the last section of the set? */
  isInLastSection: SongItemWithActionsMenuProps["isInLastSection"];

  /** call back to set if the setSection item is in edit mode */
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
    api.setSection.swapWithPrevious.useMutation();
  const swapSetSectionWithNextMutation =
    api.setSection.swapWithNext.useMutation();
  const moveSetSectionToFirstMutation =
    api.setSection.moveToFirst.useMutation();
  const moveSetSectionToLastMutation = api.setSection.moveToLast.useMutation();
  const deleteSetSectionMutation = api.setSection.delete.useMutation();

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
    const isSwapUpdate = direction === "up" || direction === "down";

    isSwapUpdate
      ? toast.loading(`Moving section ${direction}`)
      : toast.loading(`Moving section to the ${direction} position`);

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
        default: {
          const _exhaustiveCheck: never = direction;
          return _exhaustiveCheck;
        }
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

  const removeSection = () => {
    toast.loading("Removing section...");
    deleteSetSectionMutation.mutate(
      {
        organizationId: userMembership.organizationId,
        setSectionId: setSection.id,
      },
      {
        async onSuccess() {
          toast.dismiss();
          toast.success("Section removed");

          await apiUtils.set.get.invalidate({
            setId: setSection.setId,
            organizationId: userMembership.organizationId,
          });
        },
        onError(error) {
          toast.dismiss();
          toast.error(`Section could not be removed: ${error.message}`);
        },
      },
    );
  };

  const isInOnlySection = isInFirstSection && isInLastSection;

  return (
    <>
      <ActionMenu
        isOpen={isActionMenuOpen}
        setIsOpen={setIsActionMenuOpen}
        buttonVariant="ghost"
      >
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
        <ActionMenuItem
          icon="Trash"
          label="Delete section"
          destructive
          onClick={() => {
            setIsActionMenuOpen(false);
            setIsConfirmationDialogOpen(true);
          }}
        />
      </ActionMenu>
      <AlertDialog
        open={isConfirmationDialogOpen}
        onOpenChange={setIsConfirmationDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Remove {setSection.type.name} section
            </AlertDialogTitle>
            <AlertDialogDescription>
              <VStack className="gap-2 text-slate-700">
                <Text>
                  Are you sure you want to remove the {setSection.type.name}{" "}
                  section from this set?
                </Text>
                <Text>
                  This can&apos;t be undone and you&apos;ll have to re-create
                  this section and re-add all the songs.
                </Text>
              </VStack>
            </AlertDialogDescription>
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
                removeSection();
              }}
              disabled={deleteSetSectionMutation.isPending}
            >
              Remove section
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* <ReplaceSongDialog
        open={isSongSearchDialogOpen}
        setOpen={setIsSongSearchDialogOpen}
        currentSong={setSectionSong}
        setId={setId}
      /> */}
    </>
  );
};
