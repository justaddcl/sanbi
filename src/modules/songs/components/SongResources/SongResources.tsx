"use client";
import { useState } from "react";
import { Plus } from "@phosphor-icons/react";

import { Button } from "@components/ui/button";
import { Card } from "@components/Card/Card";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@components/ResponsiveDialog";
import { CreateResourceForm } from "@modules/songs/forms/CreateResourceForm";
import { type Resource } from "@lib/types";

import { ResourceCard } from "../ResourceCard";

type SongResourcesProps = {
  songId: string;
  songResources: Resource[];
};

export const SongResources: React.FC<SongResourcesProps> = ({
  songId,
  songResources,
}) => {
  const [isAddResourceDialogOpen, setIsAddResourceDialogOpen] = useState(false);

  const onSuccess = () => {
    setIsAddResourceDialogOpen(false);
  };

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
          {songResources.length > 0 &&
            songResources.map((songResource) => (
              <ResourceCard key={songResource.id} resource={songResource} />
            ))}
          {songResources.length === 0 && (
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
