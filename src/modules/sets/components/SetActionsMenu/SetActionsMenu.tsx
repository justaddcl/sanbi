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

type SetActionsMenuProps = {
  setId: string;
  organizationId: string;
  archived: boolean;
};

export const SetActionsMenu: React.FC<SetActionsMenuProps> = ({
  setId,
  organizationId,
  archived,
}) => {
  const router = useRouter();

  const [isSetActionsMenuOpen, setIsSetActionsMenuOpen] =
    useState<boolean>(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState<boolean>(false);

  // TODO: move to mutations
  const deleteSetMutation = api.set.delete.useMutation();
  const deleteSet = (organizationId: string, setId: string) => {
    setIsConfirmationDialogOpen(false);

    deleteSetMutation.mutate(
      { organizationId, setId },
      {
        onSuccess() {
          toast.success("Set deleted");
          router.push(`/${organizationId}`);
        },
        onError(error) {
          toast.error(`Set could not be deleted: ${error.message}`);
        },
      },
    );
  };

  // TODO: move to mutations
  const archiveSetMutation = api.set.archive.useMutation();
  const archiveSet = (organizationId: string, setId: string) => {
    archiveSetMutation.mutate(
      { organizationId, setId },
      {
        onSuccess() {
          toast.success("Set has been archived");
          router.refresh();
        },
        onError(error) {
          toast.error(`Set could not be archived: ${error.message}`);
        },
      },
    );
  };

  // TODO: move to mutations
  const unarchiveSetMutation = api.set.unarchive.useMutation();
  const unarchiveSet = (organizationId: string, setId: string) => {
    unarchiveSetMutation.mutate(
      { organizationId, setId },
      {
        onSuccess() {
          toast.success("Set has been unarchived");
          router.refresh();
        },
        onError(error) {
          toast.error(`Set could not be unarchived: ${error.message}`);
        },
      },
    );
  };

  return (
    <>
      <DropdownMenu
        open={isSetActionsMenuOpen}
        onOpenChange={setIsSetActionsMenuOpen}
      >
        <DropdownMenuTrigger>
          <Button variant="outline" size="sm">
            <DotsThree className="text-slate-900" size={12} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="gap-1"
            onSelect={() =>
              archived
                ? unarchiveSet(organizationId, setId)
                : archiveSet(organizationId, setId)
            }
          >
            {archived ? <BoxArrowUp /> : <Archive />}
            <Text>{archived ? "Unarchive" : "Archive"} set</Text>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-1 text-slate-400 hover:bg-red-100 hover:text-red-800 active:bg-red-200 active:text-red-900"
            onSelect={() => {
              setIsSetActionsMenuOpen(false);
              setIsConfirmationDialogOpen(true);
            }}
          >
            <Trash />
            <Text>Delete set</Text>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
        open={isConfirmationDialogOpen}
        onOpenChange={setIsConfirmationDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Are you sure you want to delete this set?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This can&apos;t be undone and will permanently delete this set. If
              you&apos;re not sure, consider archiving it instead.
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
              onClick={() => deleteSet(organizationId, setId)}
            >
              Delete set
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
