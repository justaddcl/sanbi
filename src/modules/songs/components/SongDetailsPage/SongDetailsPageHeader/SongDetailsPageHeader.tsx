"use client";

import { api } from "@/trpc/react";
import { HStack } from "@components/HStack";
import { Button } from "@components/ui/button";
import { type UserData } from "@lib/types/api";
import { SongActionsMenu } from "@modules/songs/components/SongActionsMenu";
import { Heart, Plus } from "@phosphor-icons/react";
import { type AppRouter } from "@server/api/root";
import { type inferProcedureOutput } from "@trpc/server";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { SongDetailsPageName } from "@modules/songs/components";

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
    <HStack className="justify-between gap-4">
      <SongDetailsPageName
        song={song}
        userMembership={userMembership}
        isEditing={isEditingName}
        setIsEditing={setIsEditingName}
      />
      <HStack className="items-start gap-2">
        <Button
          variant="outline"
          onClick={updateSongFavoriteStatus}
          disabled={updateSongFavoriteStatusMutation.isPending}
          size="sm"
        >
          <Heart weight={song.favoritedAt ? "fill" : "regular"} />
        </Button>
        <Button className="hidden md:flex">
          <Plus /> Add to a set
        </Button>
        <SongActionsMenu
          songId={song.id}
          organizationId={userMembership.organizationId}
          archived={song.isArchived}
          setIsEditingName={setIsEditingName}
        />
      </HStack>
    </HStack>
  );
};
