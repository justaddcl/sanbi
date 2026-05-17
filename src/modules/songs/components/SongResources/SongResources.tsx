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
import { SongResourcesEmptyState } from "./SongResourcesEmptyState";

type SongResourcesProps = {
  songId: string;
  organizationId: string;
};

export const SongResources: React.FC<SongResourcesProps> = ({
  songId,
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

  const handleAddResourceClick = () => {
    setIsAddResourceDialogOpen(true);
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
                  onEdit={setResourceBeingEdited}
                />
              ))}
            {songResources && songResources.length === 0 && (
              <SongResourcesEmptyState
                onAddResourceClick={handleAddResourceClick}
              />
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
