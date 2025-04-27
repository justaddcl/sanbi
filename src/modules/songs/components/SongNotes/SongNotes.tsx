"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import unescapeHTML from "validator/es/lib/unescape";

import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { Textarea } from "@components/ui/textarea";

import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";

import { SongDetailsItem } from "@modules/songs/components";

import { formatNumber } from "@lib/numbers/formatNumber";
import { MAX_SONG_NOTES_LENGTH } from "@lib/types/zod";
import { cn } from "@lib/utils";

import { api } from "@/trpc/react";

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
  const [notes, setNotes] = useState<string>(song?.notes ?? "");

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
      <SongDetailsItem icon="NotePencil" label="Notes">
        <VStack className="gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-40" />
        </VStack>
      </SongDetailsItem>
    );
  }

  if (songQueryError) {
    return null;
  }

  if (!notes && !isEditingNotes) {
    return (
      <SongDetailsItem icon="NotePencil" label="Notes">
        <div
          onClick={() => {
            setIsEditingNotes(true);
          }}
          onKeyDown={(keyDownEvent) => {
            if (keyDownEvent.key === "Enter" || keyDownEvent.key === " ") {
              setIsEditingNotes(true);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Add notes"
        >
          <Text style="body-small" className="text-slate-500">
            Add notes
          </Text>
        </div>
      </SongDetailsItem>
    );
  }

  return (
    <SongDetailsItem icon="NotePencil" label="Notes">
      {isEditingNotes ? (
        <VStack className="gap-4">
          <VStack className="gap-2">
            <Textarea
              value={unescapeHTML(notes)}
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
              {notes.length}/{formatNumber(MAX_SONG_NOTES_LENGTH)} characters
            </Text>
          </VStack>
          <HStack className="justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              type="button"
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
      ) : (
        <button
          type="button"
          className={cn("hover:cursor-pointer", {
            "p-[9px]": !isEditingNotes,
          })}
          onClick={() => setIsEditingNotes(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsEditingNotes(true);
            }
          }}
        >
          <Text style="body-small">{unescapeHTML(notes)}</Text>
        </button>
      )}
    </SongDetailsItem>
  );
};
