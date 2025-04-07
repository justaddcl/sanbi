"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import {
  Archive,
  BoxArrowUp,
  DotsThree,
  Trash,
} from "@phosphor-icons/react/dist/ssr";
import { Text } from "@components/Text";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { useState } from "react";
import { Button } from "@components/ui/button";
import { ActionMenu, ActionMenuItem } from "@components/ActionMenu";

type SongActionsMenuProps = {
  songId: string;
  organizationId: string;
  archived: boolean;
};

export const SongActionsMenu: React.FC<SongActionsMenuProps> = ({
  songId,
  organizationId,
  archived,
}) => {
  const router = useRouter();

  const [isSongActionsMenuOpen, setIsSongActionsMenuOpen] =
    useState<boolean>(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState<boolean>(false);

  // TODO: move to mutations
  const deleteSongMutation = api.song.delete.useMutation();
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
  const archiveSongMutation = api.song.archive.useMutation();
  const archiveSong = (organizationId: string, songId: string) => {
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
  const unarchiveSongMutation = api.song.unarchive.useMutation();
  const unarchiveSong = (organizationId: string, songId: string) => {
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
