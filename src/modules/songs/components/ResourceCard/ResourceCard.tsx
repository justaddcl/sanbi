"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
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
import {
  getErrorNameForTelemetry,
  sanitizeResourceUrlForTelemetry,
} from "@modules/songs/utils/resourceTelemetry";
import { orpc } from "@lib/orpc/client";
import { trpc } from "@lib/trpc";
import { type Resource } from "@lib/types";

import { ResourceCardImage } from "../ResourceCardImage";

export type ResourceCardProps = {
  resource: Resource;
  onEdit: (resource: Resource) => void;
};

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onEdit,
}) => {
  const { title, url } = resource;
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const trpcUtils = trpc.useUtils();
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [shouldDisableFutureWarnings, setShouldDisableFutureWarnings] =
    useState(false);

  const deleteResourceMutation = useMutation(
    orpc.resource.delete.mutationOptions(),
  );
  const updateResourceDeleteConfirmationPreferenceMutation =
    trpc.user.updateResourceDeleteConfirmationPreference.useMutation();

  const { data: userData } = trpc.user.getUser.useQuery(
    {
      userId: userId ?? "",
    },
    {
      enabled: !!userId,
    },
  );

  const handleEditResource = () => {
    setIsActionMenuOpen(false);
    onEdit(resource);
  };

  const deleteResource = async (persistDismissedWarning: boolean) => {
    setIsActionMenuOpen(false);
    setIsConfirmationDialogOpen(false);
    const toastId = toast.loading("Deleting resource...");

    try {
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

      if (persistDismissedWarning) {
        try {
          await updateResourceDeleteConfirmationPreferenceMutation.mutateAsync({
            confirmResourceDelete: false,
          });
          if (userId) {
            trpcUtils.user.getUser.setData({ userId }, (currentUserData) =>
              currentUserData
                ? { ...currentUserData, confirmResourceDelete: false }
                : currentUserData,
            );
          }
        } catch (preferenceError) {
          Sentry.captureException(preferenceError);
          toast.error(
            "Resource was deleted, but delete confirmation preference could not be saved",
            { id: toastId },
          );
          return;
        }
      }

      toast.success("Resource was deleted", { id: toastId });
      setShouldDisableFutureWarnings(false);
    } catch (error) {
      Sentry.captureException(error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      toast.error(`Could not delete resource: ${errorMessage}`, {
        id: toastId,
      });
    }
  };

  const handleDeleteResource = () => {
    setIsActionMenuOpen(false);

    if (userData?.confirmResourceDelete === false) {
      void deleteResource(false);
      return;
    }

    setIsConfirmationDialogOpen(true);
  };

  return (
    <>
      <li className="relative">
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-full grid-cols-[48px_1fr] items-center gap-2 rounded bg-slate-50 px-3 py-2 pr-14 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ResourceCardImage resource={resource} />
          <div className="flex min-w-0 flex-col gap-1 px-2 py-1">
            <Text className="truncate text-base font-semibold leading-4 text-slate-900">
              {title}
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
        <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2">
          <ActionMenu
            isOpen={isActionMenuOpen}
            setIsOpen={setIsActionMenuOpen}
            buttonVariant="ghost"
            triggerLabel={`Open actions for ${title}`}
          >
            <ActionMenuItem
              icon="Pencil"
              label="Edit resource"
              onClick={handleEditResource}
            />
            <DropdownMenuSeparator />
            <ActionMenuItem
              icon="Trash"
              label="Delete resource"
              destructive
              onClick={handleDeleteResource}
            />
          </ActionMenu>
        </div>
      </li>
      <AlertDialog
        open={isConfirmationDialogOpen}
        onOpenChange={setIsConfirmationDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This resource will be removed from the song. The linked site will
              not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`dont-warn-resource-delete-${resource.id}`}
              checked={shouldDisableFutureWarnings}
              onCheckedChange={(checked) =>
                setShouldDisableFutureWarnings(checked === true)
              }
            />
            <Label htmlFor={`dont-warn-resource-delete-${resource.id}`}>
              Don&apos;t warn me again
            </Label>
          </div>
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
              onClick={() => deleteResource(shouldDisableFutureWarnings)}
            >
              Delete resource
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
