"use client";

import { SongDetailsItem } from "@modules/songs/components";
import { Text } from "@components/Text";
import unescapeHTML from "validator/es/lib/unescape";
import { useEffect, useState } from "react";
import { VStack } from "@components/VStack";
import { Textarea } from "@components/ui/textarea";
import { HStack } from "@components/HStack";
import { Button } from "@components/ui/button";
import { toast } from "sonner";
import { cn } from "@lib/utils";
import { api } from "@/trpc/react";
import { Skeleton } from "@components/ui/skeleton";
import { MAX_SONG_NOTES_LENGTH } from "@lib/types/zod";

type SongNotesProps = {
  songId: string;
  organizationId: string;
};

export const SongNotes: React.FC<SongNotesProps> = ({
  songId,
  organizationId,
}) => {
  const {
    data: song,
    isLoading: isSongQueryLoading,
    error: songQueryError,
  } = api.song.get.useQuery({ songId, organizationId });

  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>(unescapeHTML(song?.notes ?? ""));

  const updateNotesMutation = api.song.updateNotes.useMutation();
  const apiUtils = api.useUtils();

  const handleUpdateNotes = () => {
    const toastId = toast.loading("Updating song notes...");

    updateNotesMutation.mutate(
      {
        id: songId,
        organizationId,
        notes,
      },
      {
        async onSuccess() {
          toast.success("Notes updated!", { id: toastId });

          await apiUtils.song.get.invalidate({ songId, organizationId });

          setIsEditingNotes(false);
        },

        onError(updateError) {
          toast.error(`Could not update song notes: ${updateError.message}`, {
            id: toastId,
          });
        },
      },
    );
  };

  useEffect(() => {
    setNotes(unescapeHTML(song?.notes ?? ""));
  }, [song]);

  if (isSongQueryLoading) {
    return (
      <VStack className="gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-40" />
      </VStack>
    );
  }

  if (songQueryError) {
    return null;
  }

  return (
    <SongDetailsItem icon="NotePencil" label="Notes">
      {!isEditingNotes ? (
        <div
          className={cn("hover:cursor-pointer", { "p-[9px]": !isEditingNotes })}
          onClick={() => setIsEditingNotes(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsEditingNotes(true);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <Text style="body-small">{notes}</Text>
        </div>
      ) : (
        <VStack className="gap-4">
          <VStack className="gap-2">
            <Textarea
              value={notes}
              onChange={(changeEvent) => {
                setNotes(changeEvent.target.value);
              }}
              className="px-2"
              autoFocus
              onKeyDown={(keyDownEvent) => {
                if (keyDownEvent.key === "Escape") {
                  setIsEditingNotes(false);
                  setNotes(song?.notes ?? "");
                }
              }}
              maxLength={MAX_SONG_NOTES_LENGTH}
            />
            <Text className="text-sm text-slate-500">
              {notes.length}/{MAX_SONG_NOTES_LENGTH} characters
            </Text>
          </VStack>
          <HStack className="justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsEditingNotes(false);
                setNotes(song?.notes ?? "");
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdateNotes}>
              Save notes
            </Button>
          </HStack>
        </VStack>
      )}
    </SongDetailsItem>
  );
};
