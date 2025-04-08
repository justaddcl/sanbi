"use client";

import { api } from "@/trpc/react";
import { HStack } from "@components/HStack";
import { PageTitle } from "@components/PageTitle";
import { Badge as ShadCNBadge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { VStack } from "@components/VStack";
import { sanitizeInput } from "@lib/string";
import { cn } from "@lib/utils";
import { type SongDetailsPageHeaderProps } from "@modules/songs/components/";
import { Archive } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import React, {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import unescapeHTML from "validator/es/lib/unescape";

type SongDetailsPageNameProps = {
  song: SongDetailsPageHeaderProps["song"];
  userMembership: SongDetailsPageHeaderProps["userMembership"];
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

export const SongDetailsPageName: React.FC<SongDetailsPageNameProps> = ({
  song,
  userMembership,
  isEditing,
  setIsEditing,
}) => {
  const [songName, setSongName] = useState<string>(song.name);
  const songNameInputRef = useRef<HTMLTextAreaElement>(null);

  const router = useRouter();

  const updateSongNameMutation = api.song.updateName.useMutation();
  const apiUtils = api.useUtils();

  useEffect(() => {
    setSongName(song.name);
  }, [song.name]);

  const onEditNameCancel = () => {
    setIsEditing(false);
    setSongName(song.name);
  };

  const updateSongName = () => {
    const toastId = toast.loading("Updating song name...");
    updateSongNameMutation.mutate(
      {
        organizationId: userMembership.organizationId,
        songId: song.id,
        name: sanitizeInput(songName),
      },
      {
        async onSuccess() {
          toast.success("Song name updated", { id: toastId });
          setIsEditing(false);

          await apiUtils.song.get.invalidate({
            organizationId: userMembership.organizationId,
            songId: song.id,
          });
          router.refresh();
        },
        onError(updateError) {
          toast.error(`Could not update song name: ${updateError.message}`, {
            id: toastId,
          });
        },
      },
    );
  };

  const handleKeyDown = (keyDownEvent: React.KeyboardEvent) => {
    if (keyDownEvent.key === "Enter" && !keyDownEvent.shiftKey) {
      keyDownEvent.preventDefault();
      updateSongName();
    } else if (keyDownEvent.key === "Escape") {
      onEditNameCancel();
    }
  };

  const handleOnNameChange = (
    changeEvent: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setSongName(changeEvent.target.value);
  };

  return isEditing ? (
    <VStack className="flex-1 gap-3">
      <Textarea
        rows={1}
        className={cn(
          "resize-none text-2xl font-semibold leading-tight tracking-tighter lg:text-3xl",
        )}
        ref={songNameInputRef}
        onChange={handleOnNameChange}
        onKeyDown={handleKeyDown}
        value={unescapeHTML(songName)}
      />
      <HStack className="justify-end gap-2">
        <Button size="sm" variant="outline" onClick={onEditNameCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={updateSongNameMutation.isPending}
          isLoading={updateSongNameMutation.isPending}
          onClick={updateSongName}
        >
          Save
        </Button>
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
  );
};
