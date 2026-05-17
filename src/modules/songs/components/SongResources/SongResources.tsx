"use client";
import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
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
  const [isAddResourceDialogOpen, setIsAddResourceDialogOpen] = useState(false);
  const [resourceBeingEdited, setResourceBeingEdited] =
    useState<Resource | null>(null);

  const {
    data: songResources,
    isLoading: isSongResourcesLoading,
    // TODO: SWY-118 to implement empty and error state
    error: songResourcesError,
  } = useSongResources(songId, organizationId);

  const onSuccess = () => {
    setIsAddResourceDialogOpen(false);
  };

  const closeEditDialog = () => {
    setResourceBeingEdited(null);
  };

  const addResourceButton = (
    <ResponsiveDialogTrigger asChild>
      <Button size="sm" variant="ghost">
        <Plus className="text-slate-900" size={16} />
        <span className="hidden sm:inline">Add resource</span>
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
            <Plus className="text-slate-900" size={16} />
            <span className="hidden sm:inline">Add resource</span>
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
        open={isAddResourceDialogOpen}
        onOpenChange={setIsAddResourceDialogOpen}
      >
        <Card title="Resources" collapsible button={addResourceButton}>
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
              <li>No song resources yet. Create one?</li>
            )}
          </ul>
        </Card>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              Create a song resource
            </ResponsiveDialogTitle>
            <VisuallyHidden.Root>
              <ResponsiveDialogDescription>
                Create a song resource
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
