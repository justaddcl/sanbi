"use client";

import { HStack } from "@components/HStack";
import { PageTitle } from "@components/PageTitle";
import { Badge as ShadCNBadge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { VStack } from "@components/VStack";
import { cn } from "@lib/utils";
import { SongActionsMenu } from "@modules/songs/components/SongActionsMenu";
import { Archive, Heart, Plus } from "@phosphor-icons/react";
import { type AppRouter } from "@server/api/root";
import { type inferProcedureOutput } from "@trpc/server";
import React, { useRef, useState } from "react";

// TODO: move to a more appropriate location
type UserData = inferProcedureOutput<AppRouter["user"]["getUser"]>;

type SongDetailsPageHeaderProps = {
  song: inferProcedureOutput<AppRouter["song"]["get"]>;
  userMembership: NonNullable<UserData>["memberships"][number];
};

export const SongDetailsPageHeader: React.FC<SongDetailsPageHeaderProps> = ({
  song,
  userMembership,
}) => {
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [songName, setSongName] = useState<string>(song.name);
  const songNameInputRef = useRef<HTMLTextAreaElement>(null);

  const onEditNameCancel = () => {
    setIsEditingName(false);
  };

  const handleKeyDown = (keyDownEvent: React.KeyboardEvent) => {
    if (keyDownEvent.key === "Enter" && !keyDownEvent.shiftKey) {
      keyDownEvent.preventDefault();
      // handleSave();
    } else if (keyDownEvent.key === "Escape") {
      onEditNameCancel();
    }
  };

  const handleOnNameChange = (
    changeEvent: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setSongName(changeEvent.target.value);
  };

  return (
    <HStack className="justify-between gap-4">
      {isEditingName ? (
        <VStack className="flex-1 gap-3">
          <Textarea
            rows={1}
            className={cn(
              "resize-none text-2xl font-semibold leading-tight tracking-tighter lg:text-3xl",
            )}
            ref={songNameInputRef}
            onChange={handleOnNameChange}
            onKeyDown={handleKeyDown}
            value={songName}
          />
          <HStack className="justify-end gap-2">
            <Button size="sm" variant="outline" onClick={onEditNameCancel}>
              Cancel
            </Button>
            <Button size="sm">Save</Button>
          </HStack>
        </VStack>
      ) : (
        <PageTitle
          title={song.name}
          badge={
            song.isArchived ? (
              <ShadCNBadge variant="warn" className="gap-1">
                <Archive />
                Archived
              </ShadCNBadge>
            ) : undefined
          }
        />
      )}
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
