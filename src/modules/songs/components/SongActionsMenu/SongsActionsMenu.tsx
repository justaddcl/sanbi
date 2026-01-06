"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  BoxArrowUp,
  DotsThree,
  Trash,
} from "@phosphor-icons/react/dist/ssr";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { ActionMenu, ActionMenuItem } from "@components/ActionMenu";
import { Text } from "@components/Text";
import { trpc } from "@lib/trpc";

type SongActionsMenuProps = {
  songId: string;
  organizationId: string;
  archived: boolean;
  setIsEditingName: Dispatch<SetStateAction<boolean>>;
};

export const SongActionsMenu: React.FC<SongActionsMenuProps> = ({
  songId,
  organizationId,
  archived,
  setIsEditingName,
}) => {
  const router = useRouter();

  const [isSongActionsMenuOpen, setIsSongActionsMenuOpen] =
    useState<boolean>(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState<boolean>(false);

  // TODO: move to mutations
  const deleteSongMutation = trpc.song.delete.useMutation();
  const deleteSong = (organizationId: string, songId: string) => {
    setIsConfirmationDialogOpen(false);

    deleteSongMutation.mutate(
      { organizationId, songId },
      {
        onSuccess() {
          toast.success("Song deleted");
          router.push(`/${organizationId}`);
        },
        onError(error) {
          toast.error(`Song could not be deleted: ${error.message}`);
        },
      },
    );
  };

  // TODO: move to mutations
  const archiveSongMutation = trpc.song.archive.useMutation();
  const archiveSong = (organizationId: string, songId: string) => {
    setIsSongActionsMenuOpen(false);
    archiveSongMutation.mutate(
      { organizationId, songId },
      {
        onSuccess() {
          toast.success("Song has been archived");
          router.refresh();
        },
        onError(error) {
          toast.error(`Song could not be archived: ${error.message}`);
        },
      },
    );
  };

  // TODO: move to mutations
  const unarchiveSongMutation = trpc.song.unarchive.useMutation();
  const unarchiveSong = (organizationId: string, songId: string) => {
    setIsSongActionsMenuOpen(false);
    unarchiveSongMutation.mutate(
      { organizationId, songId },
      {
        onSuccess() {
          toast.success("Song has been unarchived");
          router.refresh();
        },
        onError(error) {
          toast.error(`Song could not be unarchived: ${error.message}`);
        },
      },
    );
  };

  return (
    <>
      <ActionMenu
        isOpen={isSongActionsMenuOpen}
        setIsOpen={setIsSongActionsMenuOpen}
      >
        <ActionMenuItem
          icon="Pencil"
          label="Edit song name"
          onClick={() => {
            setIsSongActionsMenuOpen(false);
            setIsEditingName(true);
          }}
        />
        <ActionMenuItem
          icon={archived ? "BoxArrowUp" : "Archive"}
          label={archived ? "Unarchive" : "Archive"}
          onClick={() =>
            archived
              ? unarchiveSong(organizationId, songId)
              : archiveSong(organizationId, songId)
          }
        />
        <DropdownMenuSeparator />
        <ActionMenuItem
          icon="Trash"
          label="Delete song"
          destructive
          onClick={() => {
            setIsSongActionsMenuOpen(false);
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
              Are you sure you want to delete this song?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This can&apos;t be undone and will permanently delete this song.
              If you&apos;re not sure, consider archiving it instead.
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
              onClick={() => deleteSong(organizationId, songId)}
            >
              Delete song
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
