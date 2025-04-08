"use client";

import { HStack } from "@components/HStack";
import { Button } from "@components/ui/button";
import { SongActionsMenu } from "@modules/songs/components/SongActionsMenu";
import { Heart, Plus } from "@phosphor-icons/react";
import { type AppRouter } from "@server/api/root";
import { type inferProcedureOutput } from "@trpc/server";
import React, { useState } from "react";
import { SongDetailsPageName } from "../SongDetailsPageSongName/SongDetailsPageSongName";

// TODO: move to a more appropriate location
type UserData = inferProcedureOutput<AppRouter["user"]["getUser"]>;

export type SongDetailsPageHeaderProps = {
  song: inferProcedureOutput<AppRouter["song"]["get"]>;
  userMembership: NonNullable<UserData>["memberships"][number];
};

export const SongDetailsPageHeader: React.FC<SongDetailsPageHeaderProps> = ({
  song,
  userMembership,
}) => {
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  return (
    <HStack className="justify-between gap-4">
      <SongDetailsPageName
        song={song}
        userMembership={userMembership}
        isEditing={isEditingName}
        setIsEditing={setIsEditingName}
      />
      <HStack className="items-start gap-2">
        <Button variant="outline" className="hidden md:flex">
          <Heart />
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
