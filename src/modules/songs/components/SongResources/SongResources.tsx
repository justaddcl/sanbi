"use client";
import { useState } from "react";
import { Plus } from "@phosphor-icons/react";

import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { Card } from "@components/Card/Card";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@components/ResponsiveDialog";
import { CreateResourceForm } from "@modules/songs/forms/CreateResourceForm";
import { useSongResources } from "@modules/songs/queries/useSongResources";

import { ResourceCard } from "../ResourceCard";

type SongResourcesProps = {
  songId: string;
};

export const SongResources: React.FC<SongResourcesProps> = ({ songId }) => {
  const [isAddResourceDialogOpen, setIsAddResourceDialogOpen] = useState(false);

  const {
    data: songResources,
    isLoading: isSongResourcesLoading,
    // TODO: SWY-118 to implement empty and error state
    error: songResourcesError,
  } = useSongResources(songId);

  const onSuccess = () => {
    setIsAddResourceDialogOpen(false);
  };

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
    <ResponsiveDialog
      open={isAddResourceDialogOpen}
      onOpenChange={setIsAddResourceDialogOpen}
    >
      <Card
        title="Resources"
        collapsible
        button={
          <ResponsiveDialogTrigger asChild>
            <Button size="sm" variant="ghost">
              <Plus className="text-slate-900" size={16} />
              <span className="hidden sm:inline">Add resource</span>
            </Button>
          </ResponsiveDialogTrigger>
        }
      >
        <ul className="grid gap-3 md:grid-cols-2">
          {songResources &&
            songResources.length > 0 &&
            songResources.map((songResource) => (
              <ResourceCard key={songResource.id} resource={songResource} />
            ))}
          {songResources && songResources.length === 0 && (
            // Empty state will be implemented in SWY-118
            <div>No song resources yet. Create one?</div>
          )}
        </ul>
      </Card>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Create a song resource</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <CreateResourceForm songId={songId} onSuccess={onSuccess} />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
