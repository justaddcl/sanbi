"use client";
import { useState } from "react";
import { LinkSimple } from "@phosphor-icons/react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { Card } from "@components/Card/Card";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@components/ResponsiveDialog";
import { ResourceForm } from "@modules/songs/forms/CreateResourceForm";
import { useSongResources } from "@modules/songs/queries/useSongResources";
import { type Resource } from "@lib/types";

import { EditResourceDialog } from "../EditResourceDialog";
import { ResourceCard } from "../ResourceCard";

type SongResourcesProps = {
  songId: string;
  songName: string;
  organizationId: string;
};

export const SongResources: React.FC<SongResourcesProps> = ({
  songId,
  songName,
  organizationId,
}) => {
  const [isLinkResourceDialogOpen, setIsLinkResourceDialogOpen] =
    useState(false);
  const [resourceBeingEdited, setResourceBeingEdited] =
    useState<Resource | null>(null);

  const {
    data: songResources,
    isLoading: isSongResourcesLoading,
    // TODO: SWY-118 to implement empty and error state
    error: songResourcesError,
  } = useSongResources(songId, organizationId);

  const onSuccess = () => {
    setIsLinkResourceDialogOpen(false);
  };

  const closeEditDialog = () => {
    setResourceBeingEdited(null);
  };

  const linkResourceButton = (
    <ResponsiveDialogTrigger asChild>
      <Button size="sm" variant="ghost">
        <LinkSimple className="text-slate-900" size={16} />
        <span className="hidden sm:inline">Link resource</span>
      </Button>
    </ResponsiveDialogTrigger>
  );

  if (isSongResourcesLoading) {
    return (
      <Card
        title="Resources"
        collapsible
        button={
          <Button size="sm" variant="ghost" disabled>
            <LinkSimple className="text-slate-900" size={16} />
            <span className="hidden sm:inline">Link resource</span>
          </Button>
        }
      >
        <ul className="grid gap-3 md:grid-cols-2">
          <li>
            <Skeleton className="h-16" />
          </li>
          <li>
            <Skeleton className="h-16" />
          </li>
          <li>
            <Skeleton className="h-16" />
          </li>
        </ul>
      </Card>
    );
  }

  return (
    <>
      <ResponsiveDialog
        open={isLinkResourceDialogOpen}
        onOpenChange={setIsLinkResourceDialogOpen}
      >
        <Card title="Resources" collapsible button={linkResourceButton}>
          <ul className="grid gap-3 md:grid-cols-2">
            {songResources &&
              songResources.length > 0 &&
              songResources.map((songResource) => (
                <ResourceCard
                  key={songResource.id}
                  resource={songResource}
                  songName={songName}
                  onEdit={setResourceBeingEdited}
                />
              ))}
            {songResources && songResources.length === 0 && (
              // Empty state will be implemented in SWY-118
              <li>No song resources yet. Link one?</li>
            )}
          </ul>
        </Card>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Link a song resource</ResponsiveDialogTitle>
            <VisuallyHidden.Root>
              <ResponsiveDialogDescription>
                Link a song resource
              </ResponsiveDialogDescription>
            </VisuallyHidden.Root>
          </ResponsiveDialogHeader>
          <ResourceForm
            mode="create"
            songId={songId}
            organizationId={organizationId}
            onSuccess={onSuccess}
          />
        </ResponsiveDialogContent>
      </ResponsiveDialog>
      <EditResourceDialog
        resource={resourceBeingEdited}
        onClose={closeEditDialog}
      />
    </>
  );
};
