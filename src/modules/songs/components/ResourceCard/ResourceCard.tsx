"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";
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
import { Label } from "@components/ui/label";
import { getResourceDisplayTitle } from "@modules/songs/utils/getResourceDisplayTitle";
import {
  getErrorNameForTelemetry,
  sanitizeResourceUrlForTelemetry,
} from "@modules/songs/utils/resourceTelemetry";
import { trpc } from "@lib/trpc";
import { type Resource } from "@lib/types";

import { ResourceCardDisplay } from "./ResourceCardDisplay";

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
  const apiUtils = trpc.useUtils();
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [shouldDisableFutureWarnings, setShouldDisableFutureWarnings] =
    useState(false);
  const canPersistDeleteWarningPreference =
    onResourceDeleteConfirmationPreferenceChange !== undefined;

  const deleteResourceMutation = trpc.resource.delete.useMutation();
  const refreshMetadataMutation = trpc.resource.refreshMetadata.useMutation();

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

      await apiUtils.resource.getBySongId.invalidate({
        songId: resource.songId,
        organizationId: resource.organizationId,
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

      await apiUtils.resource.getBySongId.invalidate({
        songId: resource.songId,
        organizationId: resource.organizationId,
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
      <ResourceCardDisplay
        resource={resource}
        isActionMenuOpen={isActionMenuOpen}
        setIsActionMenuOpen={setIsActionMenuOpen}
        isRefreshPending={refreshMetadataMutation.isPending}
        onEdit={handleEditResource}
        onRefreshPreview={refreshResourceMetadata}
        onUnlink={handleDeleteResource}
        onDisplayUrlParseError={(error) => {
          Sentry.captureMessage("Failed to parse resource URL", {
            level: "warning",
            extra: {
              url: sanitizeResourceUrlForTelemetry(url),
              error: getErrorNameForTelemetry(error),
            },
          });
        }}
      />
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
