"use client";

import { SongDetailsItem } from "@modules/songs/components";
import { Text } from "@components/Text";
import unescapeHTML from "validator/es/lib/unescape";
import { useState } from "react";
import { VStack } from "@components/VStack";
import { Textarea } from "@components/ui/textarea";
import { HStack } from "@components/HStack";
import { Button } from "@components/ui/button";
import { toast } from "sonner";
import { cn } from "@lib/utils";
import { api } from "@/trpc/react";

type SongNotesProps = {
  songId: string;
  songNotes: string;
  organizationId: string;
};

export const SongNotes: React.FC<SongNotesProps> = ({
  songId,
  songNotes,
  organizationId,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>(songNotes ?? "");

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
          toast.error(`Could not update set notes: ${updateError.message}`, {
            id: toastId,
          });
        },
      },
    );
  };

  return (
    <SongDetailsItem icon="NotePencil" label="Notes">
      {!isEditingNotes ? (
        <div
          className={cn("hover:cursor-pointer", { "p-[9px]": !isEditingNotes })}
          onClick={() => setIsEditingNotes(true)}
        >
          <Text style="body-small">{unescapeHTML(notes)}</Text>
        </div>
      ) : (
        <VStack className="gap-4">
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
                setNotes(songNotes ?? "");
              }
            }}
          />
          <HStack className="justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsEditingNotes(false);
                setNotes(songNotes ?? "");
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
