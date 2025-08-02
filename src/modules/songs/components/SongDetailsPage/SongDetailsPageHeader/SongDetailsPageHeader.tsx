"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "@phosphor-icons/react";
import { type inferProcedureOutput } from "@trpc/server";
import { toast } from "sonner";

import { Button } from "@components/ui/button";
import { HStack } from "@components/HStack";
import { SongDetailsPageName } from "@modules/songs/components";
import { SongActionsMenu } from "@modules/songs/components/SongActionsMenu";
import { AddSongToSetDialog } from "@modules/songs/forms/AddSongToSet/components/AddSongToSetDialog";
import { type UserData } from "@lib/types/api";
import { type AppRouter } from "@server/api/root";
import { api } from "@/trpc/react";

export type SongDetailsPageHeaderProps = {
  song: inferProcedureOutput<AppRouter["song"]["get"]>;
  userMembership: NonNullable<UserData>["memberships"][number];
};

export const SongDetailsPageHeader: React.FC<SongDetailsPageHeaderProps> = ({
  song,
  userMembership,
}) => {
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  const router = useRouter();

  const updateSongFavoriteStatusMutation =
    api.song.updateFavoriteStatus.useMutation();

  const updateSongFavoriteStatus = () => {
    const toastId = toast.loading(
      `${song.favoritedAt ? "Unfavoriting" : "Favoriting"} song...`,
    );
    // TODO: for future enhancement - add optimistic update?

    updateSongFavoriteStatusMutation.mutate(
      {
        organizationId: userMembership.organizationId,
        songId: song.id,
        isFavorite: !song.favoritedAt,
      },
      {
        onSuccess() {
          toast.success(
            `Song ${song.favoritedAt ? "unfavorited" : "favorited"}`,
            { id: toastId },
          );
          router.refresh();
        },
        onError(updateError) {
          toast.error(
            `Song could not be ${song.favoritedAt ? "unfavorited" : "favorited"}: ${updateError.message}`,
            { id: toastId },
          );
        },
      },
    );
  };

  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:gap-8">
      <SongDetailsPageName
        song={song}
        userMembership={userMembership}
        isEditing={isEditingName}
        setIsEditing={setIsEditingName}
      />
      <HStack className="items-start gap-2">
        <AddSongToSetDialog song={song} />
        <Button
          variant="outline"
          onClick={updateSongFavoriteStatus}
          disabled={updateSongFavoriteStatusMutation.isPending}
          size="sm"
        >
          <Heart weight={song.favoritedAt ? "fill" : "regular"} />
        </Button>
        <SongActionsMenu
          songId={song.id}
          organizationId={userMembership.organizationId}
          archived={song.isArchived}
          setIsEditingName={setIsEditingName}
        />
      </HStack>
    </div>
  );
};
