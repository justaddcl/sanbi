"use client";

import { api } from "@/trpc/react";
import { HStack } from "@components/HStack";
import { PageTitle } from "@components/PageTitle";
import { Badge as ShadCNBadge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { VStack } from "@components/VStack";
import { songNameSchema } from "@lib/types/zod";
import { cn } from "@lib/utils";
import { type SongDetailsPageHeaderProps } from "@modules/songs/components/";
import { Archive } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import React, {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { Text } from "@components/Text";

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
  const [inputError, setInputError] = useState<string | undefined>(undefined);
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
    setInputError(undefined);
  };

  const updateSongName = () => {
    setInputError(undefined);

    const validationResult = songNameSchema.safeParse(songName);

    if (!validationResult.success) {
      const [formattedError] = validationResult.error.format()._errors;
      setInputError(formattedError);
      return;
    }

    const toastId = toast.loading("Updating song name...");
    updateSongNameMutation.mutate(
      {
        organizationId: userMembership.organizationId,
        songId: song.id,
        name: validationResult.data,
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
    <VStack className="flex-1 gap-1 md:gap-3">
      <Textarea
        rows={1}
        className={cn(
          "resize-none text-2xl font-semibold leading-tight tracking-tighter lg:text-3xl",
          [!!inputError && "border-red-200"],
        )}
        ref={songNameInputRef}
        onChange={handleOnNameChange}
        onKeyDown={handleKeyDown}
        value={songName}
      />
      <VStack className="items-end gap-2 md:flex-row md:justify-end md:gap-4">
        {/* TODO: replace with a reusable form field message component */}
        {inputError && (
          <Text className="flex-1 self-start text-red-900">{inputError}</Text>
        )}
        <HStack className="mt-2 gap-2 md:mt-0">
          <Button size="sm" variant="outline" onClick={onEditNameCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={
              songName === song.name || updateSongNameMutation.isPending
            }
            isLoading={updateSongNameMutation.isPending}
            onClick={updateSongName}
          >
            Save
          </Button>
        </HStack>
      </VStack>
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
