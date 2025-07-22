import React, { useState } from "react";
import { type inferProcedureOutput } from "@trpc/server";
import { toast } from "sonner";

import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { Card } from "@components/Card/Card";
import { HStack } from "@components/HStack";
import { SongKey } from "@components/SongKey";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { SongContent } from "@modules/SetListCard/components/SongContent";
import { SelectedSetCard } from "@modules/songs/forms/AddSongToSet/components";
import { useUserQuery } from "@modules/users/api/queries";
import { type SongKey as SongKeyType } from "@lib/constants";
import { type AppRouter } from "@server/api/root";
import { api } from "@/trpc/react";

type ReviewStepProps = {
  selectedSetId: string;
  selectedSetSection: string;
  song: inferProcedureOutput<AppRouter["song"]["get"]>;
  songKey: SongKeyType;
  orderedSongIds: string[];
  onAddSong?: () => void;
};

export const ReviewStep: React.FC<ReviewStepProps> = ({
  selectedSetId,
  selectedSetSection,
  song,
  songKey,
  orderedSongIds,
  onAddSong,
}) => {
  const [notes, setNotes] = useState<string>("");

  const { userMembership } = useUserQuery();

  if (!userMembership) {
    return null;
  }

  const apiUtils = api.useUtils();
  const addSetSectionSongAndReorderSongsMutation =
    api.setSectionSong.addAndReorderSongs.useMutation();

  const { data: setData } = api.set.get.useQuery({
    setId: selectedSetId,
    organizationId: userMembership.organizationId,
  });

  const { data: setSectionData } = api.setSection.get.useQuery({
    setSectionId: selectedSetSection,
    organizationId: userMembership.organizationId,
  });

  // TODO: figure out better handling
  if (!setData || !setSectionData) {
    return null;
  }

  const setSectionSongs = setSectionData.songs.map((setSectionSong) => ({
    id: setSectionSong.id,
    songKey: setSectionSong.key,
    name: setSectionSong.song.name,
    index: setSectionSong.position,
    type: "existing",
  }));

  const songPosition = orderedSongIds.findIndex((songId) => song.id === songId);

  const setSectionSongsWithNewSong = setSectionSongs.toSpliced(
    songPosition,
    0,
    {
      id: song.id,
      name: song.name,
      index: songPosition + 1,
      songKey: songKey,
      type: "new",
    },
  );

  const handleAddSongToSetSubmit = async () => {
    const toastId = toast.loading("Adding song to set...");

    addSetSectionSongAndReorderSongsMutation.mutate(
      {
        setSectionId: selectedSetSection,
        newSong: {
          songId: song.id,
          key: songKey,
          notes,
        },
        newSongTempId: song.id,
        orderedSongIds,
        organizationId: userMembership.organizationId,
      },
      {
        async onSuccess() {
          toast.success("Song added to set!", { id: toastId });

          await apiUtils.song.get.invalidate({ songId: song.id });
          await apiUtils.set.get.invalidate({ setId: selectedSetId });
          // FIXME: doesn't seem to update the SSR data on the song page
          // await apiUtils.song.getPlayHistory.invalidate({
          //   songId: song.id,
          //   // organizationId: userMembership.organizationId,
          // });

          onAddSong?.();
        },
        onError(addSongError) {
          toast.error(`Could not add song to set: ${addSongError.message}`, {
            id: toastId,
          });
        },
      },
    );
  };

  return (
    <VStack className="gap-4 p-6 pt-2 md:gap-8">
      <VStack className="gap-4">
        <Text className="text-lg font-medium text-slate-900">
          Does this look right?
        </Text>

        <VStack className="gap-1">
          <Text className="font-medium text-slate-700">Adding</Text>
          <HStack className="items-center justify-between rounded-lg border border-slate-200 p-3">
            <Text className="font-medium md:text-lg">{song.name}</Text>
          </HStack>
        </VStack>
        <VStack className="gap-1">
          <Text className="font-medium text-slate-700">Played in</Text>
          <HStack className="items-center justify-between rounded-lg border border-slate-200 p-3">
            <SongKey songKey={songKey} size="large" />
          </HStack>
        </VStack>
        <VStack className="gap-1">
          <Text className="font-medium text-slate-700">In set</Text>
          <SelectedSetCard set={setData} countShown="songs" />
        </VStack>
        <VStack className="gap-1">
          <Text className="font-medium text-slate-700">In section</Text>
          <Card
            title={setSectionData.type.name}
            childrenClassName="md:py-4 px-3"
          >
            <VStack className="gap-2">
              {setSectionSongsWithNewSong.map((song, index) => (
                <SongContent
                  key={song.id}
                  name={song.name}
                  index={index + 1}
                  songKey={song.songKey}
                  muted={song.type === "existing"}
                />
              ))}
            </VStack>
          </Card>
        </VStack>
        <VStack className="gap-1">
          <Text className="font-medium text-slate-700">Song notes</Text>
          <Textarea
            value={notes}
            onChange={(changeEvent) => {
              setNotes(changeEvent.target.value);
            }}
          />
        </VStack>
      </VStack>
      <Button
        onClick={handleAddSongToSetSubmit}
        disabled={addSetSectionSongAndReorderSongsMutation.isPending}
      >
        Add song to set
      </Button>
    </VStack>
  );
};
