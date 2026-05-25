"use client";

import { useState } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { DropdownMenuSeparator } from "@components/ui/dropdown-menu";
import { Label } from "@components/ui/label";
import { ActionMenu, ActionMenuItem } from "@components/ActionMenu";
import { Text } from "@components/Text";
import { getDisplayUrl } from "@modules/songs/utils/getDisplayUrl";
import { getResourceDisplayTitle } from "@modules/songs/utils/getResourceDisplayTitle";
import {
  getErrorNameForTelemetry,
  sanitizeResourceUrlForTelemetry,
} from "@modules/songs/utils/resourceTelemetry";
import { orpc } from "@lib/orpc/client";
import { type Resource } from "@lib/types";

import { ResourceCardImage } from "../ResourceCardImage";

export type ResourceCardProps = {
  resource: Resource;
  songName: string;
  confirmResourceDelete?: boolean;
  onResourceDeleteConfirmationPreferenceChange?: (
    confirmResourceDelete: boolean,
  ) => Promise<void>;
  onEdit: (resource: Resource) => void;
};

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  songName,
  confirmResourceDelete = true,
  onResourceDeleteConfirmationPreferenceChange,
  onEdit,
}) => {
  const { url } = resource;
  const displayTitle = getResourceDisplayTitle(resource);
  const queryClient = useQueryClient();
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [shouldDisableFutureWarnings, setShouldDisableFutureWarnings] =
    useState(false);
  const canPersistDeleteWarningPreference =
    onResourceDeleteConfirmationPreferenceChange !== undefined;

  const deleteResourceMutation = useMutation(
    orpc.resource.delete.mutationOptions(),
  );
  const refreshMetadataMutation = useMutation(
    orpc.resource.refreshMetadata.mutationOptions(),
  );

  const handleEditResource = () => {
    setIsActionMenuOpen(false);
    onEdit(resource);
  };

  const deleteResource = async (persistDismissedWarning = false) => {
    setIsActionMenuOpen(false);
    setIsConfirmationDialogOpen(false);
    const toastId = toast.loading("Unlinking resource...");

    try {
      if (persistDismissedWarning && canPersistDeleteWarningPreference) {
        try {
          await onResourceDeleteConfirmationPreferenceChange(false);
        } catch (preferenceError) {
          Sentry.captureException(preferenceError);
        }
      }

      await deleteResourceMutation.mutateAsync({
        resourceId: resource.id,
        organizationId: resource.organizationId,
      });

      await queryClient.invalidateQueries({
        queryKey: orpc.resource.getBySongId.queryOptions({
          input: {
            songId: resource.songId,
            organizationId: resource.organizationId,
          },
        }).queryKey,
      });

      toast.success("Resource was unlinked", { id: toastId });
    } catch (error) {
      Sentry.captureException(error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      toast.error(`Could not unlink resource: ${errorMessage}`, {
        id: toastId,
      });
    } finally {
      setShouldDisableFutureWarnings(false);
    }
  };

  const handleDeleteResource = () => {
    setIsActionMenuOpen(false);

    if (!confirmResourceDelete) {
      void deleteResource();
      return;
    }

    setIsConfirmationDialogOpen(true);
  };

  const refreshResourceMetadata = async () => {
    setIsActionMenuOpen(false);
    const toastId = toast.loading("Refreshing preview...");

    try {
      await refreshMetadataMutation.mutateAsync({
        resourceId: resource.id,
        organizationId: resource.organizationId,
      });

      await queryClient.invalidateQueries({
        queryKey: orpc.resource.getBySongId.queryOptions({
          input: {
            songId: resource.songId,
            organizationId: resource.organizationId,
          },
        }).queryKey,
      });

      toast.success("Resource preview was refreshed", { id: toastId });
    } catch (error) {
      Sentry.captureException(error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      toast.error(`Could not refresh resource preview: ${errorMessage}`, {
        id: toastId,
      });
    }
  };

  return (
    <>
      <li className="relative">
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-visible:ring-ring grid h-full grid-cols-[48px_1fr] items-center gap-2 rounded bg-slate-50 px-3 py-2 pr-14 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
        >
          <ResourceCardImage resource={resource} />
          <div className="flex min-w-0 flex-col gap-1 px-2 py-1">
            <Text className="truncate text-base leading-4 font-semibold text-slate-900">
              {displayTitle}
            </Text>
            <Text className="truncate text-xs text-slate-400">
              {getDisplayUrl(url, {
                onParseError: (error) => {
                  Sentry.captureMessage("Failed to parse resource URL", {
                    level: "warning",
                    extra: {
                      url: sanitizeResourceUrlForTelemetry(url),
                      error: getErrorNameForTelemetry(error),
                    },
                  });
                },
              })}
            </Text>
          </div>
        </Link>
        <div className="absolute top-1/2 right-2 z-10 -translate-y-1/2">
          <ActionMenu
            isOpen={isActionMenuOpen}
            setIsOpen={setIsActionMenuOpen}
            buttonVariant="ghost"
            triggerLabel={`Open actions for ${displayTitle}`}
          >
            <ActionMenuItem
              icon="Pencil"
              label="Edit resource"
              onClick={handleEditResource}
            />
            <ActionMenuItem
              icon="ArrowClockwise"
              label="Refresh preview"
              disabled={refreshMetadataMutation.isPending}
              onClick={refreshResourceMetadata}
            />
            <DropdownMenuSeparator />
            <ActionMenuItem
              icon="LinkBreak"
              label="Unlink resource"
              destructive
              onClick={handleDeleteResource}
            />
          </ActionMenu>
        </div>
      </li>
      <AlertDialog
        open={isConfirmationDialogOpen}
        onOpenChange={(isOpen) => {
          setIsConfirmationDialogOpen(isOpen);

          if (!isOpen) {
            setShouldDisableFutureWarnings(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink {displayTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently unlink{" "}
              <span className="font-medium text-slate-700">{displayTitle}</span>{" "}
              from{" "}
              <span className="font-medium text-slate-700">{songName}</span>.
              This can&apos;t be undone, but you can manually re-link the
              resource later if you need it again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {canPersistDeleteWarningPreference ? (
            <div className="flex items-center justify-center gap-2 pt-1 sm:justify-start sm:pt-3">
              <Checkbox
                id={`dont-warn-resource-delete-${resource.id}`}
                checked={shouldDisableFutureWarnings}
                onCheckedChange={(checked) =>
                  setShouldDisableFutureWarnings(checked === true)
                }
              />
              <Label
                className="text-sm font-normal text-slate-500"
                htmlFor={`dont-warn-resource-delete-${resource.id}`}
              >
                Don&apos;t warn me again
              </Label>
            </div>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsConfirmationDialogOpen(false);
                setShouldDisableFutureWarnings(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteResourceMutation.isPending}
              onClick={() => deleteResource(shouldDisableFutureWarnings)}
            >
              Unlink resource
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
