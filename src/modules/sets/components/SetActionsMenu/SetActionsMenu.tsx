"use client";

import {
  type DropdownMenuContentProps,
  DropdownMenuSeparator,
} from "@components/ui/dropdown-menu";
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
import { type SetStateAction, type Dispatch, useState } from "react";
import { Button } from "@components/ui/button";
import { ActionMenu, ActionMenuItem } from "@components/ActionMenu";

type SetActionsMenuProps = {
  setId: string;
  organizationId: string;
  archived: boolean;
  setIsAddSectionDialogOpen: Dispatch<SetStateAction<boolean>>;
  align?: DropdownMenuContentProps["align"];
  side?: DropdownMenuContentProps["side"];
};

export const SetActionsMenu: React.FC<SetActionsMenuProps> = ({
  setId,
  organizationId,
  archived,
  setIsAddSectionDialogOpen,
}) => {
  const router = useRouter();

  const [isSetActionsMenuOpen, setIsSetActionsMenuOpen] =
    useState<boolean>(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState<boolean>(false);

  const deleteSetMutation = api.set.delete.useMutation();
  const archiveSetMutation = api.set.archive.useMutation();
  const unarchiveSetMutation = api.set.unarchive.useMutation();
  const apiUtils = api.useUtils();

  // TODO: move to mutations
  const deleteSet = () => {
    setIsConfirmationDialogOpen(false);
    const toastId = toast.loading("Deleting set...");

    deleteSetMutation.mutate(
      { organizationId, setId },
      {
        onSuccess() {
          toast.success("Set deleted", { id: toastId });
          router.push(`/${organizationId}`);
        },
        onError(error) {
          toast.error(`Set could not be deleted: ${error.message}`, {
            id: toastId,
          });
        },
      },
    );
  };

  // TODO: move to mutations
  const archiveSet = () => {
    setIsSetActionsMenuOpen(false);
    const toastId = toast.loading("Archiving set...");

    archiveSetMutation.mutate(
      { organizationId, setId },
      {
        async onSuccess() {
          toast.success("Set has been archived", { id: toastId });
          await apiUtils.set.get.invalidate({ setId, organizationId });
        },
        onError(error) {
          toast.error(`Set could not be archived: ${error.message}`, {
            id: toastId,
          });
        },
      },
    );
  };

  // TODO: move to mutations
  const unarchiveSet = () => {
    setIsSetActionsMenuOpen(false);
    const toastId = toast.loading("Unarchiving set...");

    unarchiveSetMutation.mutate(
      { organizationId, setId },
      {
        async onSuccess() {
          toast.success("Set has been unarchived", { id: toastId });
          await apiUtils.set.get.invalidate({ setId, organizationId });
        },
        onError(error) {
          toast.error(`Set could not be unarchived: ${error.message}`, {
            id: toastId,
          });
        },
      },
    );
  };

  return (
    <>
      <ActionMenu
        isOpen={isSetActionsMenuOpen}
        setIsOpen={setIsSetActionsMenuOpen}
        align="center"
      >
        <ActionMenuItem
          icon="Plus"
          label="Add set section"
          onClick={() => {
            setIsSetActionsMenuOpen(false);
            setIsAddSectionDialogOpen(true);
          }}
        />
        <DropdownMenuSeparator />
        <ActionMenuItem icon="Pencil" label="Edit set details" />
        <ActionMenuItem icon="Copy" label="Duplicate set" />
        {archived ? (
          <ActionMenuItem
            icon="BoxArrowUp"
            label="Unarchive set"
            onClick={unarchiveSet}
          />
        ) : (
          <ActionMenuItem
            icon="Archive"
            label="Archive set"
            onClick={archiveSet}
          />
        )}
        <DropdownMenuSeparator />
        <ActionMenuItem
          icon="Trash"
          label="Delete set"
          destructive
          onClick={() => {
            setIsSetActionsMenuOpen(false);
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
            <Button variant="destructive" onClick={() => deleteSet()}>
              Delete set
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
