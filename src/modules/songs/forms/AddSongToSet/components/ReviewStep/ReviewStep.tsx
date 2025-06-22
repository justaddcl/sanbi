import React from "react";
import { type inferProcedureOutput } from "@trpc/server";

import { Button } from "@components/ui/button";
import { Card } from "@components/Card/Card";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { SongContent } from "@modules/SetListCard/components/SongContent";
import { useUserQuery } from "@modules/users/api/queries";
import { type SongKey } from "@lib/constants";
import { cn } from "@lib/utils";
import { type AppRouter } from "@server/api/root";
import { api } from "@/trpc/react";

type ReviewStepProps = {
  selectedSetSection: string;
  song: inferProcedureOutput<AppRouter["song"]["get"]>;
  songKey: SongKey;
  position: number;
};

export const ReviewStep: React.FC<ReviewStepProps> = ({
  selectedSetSection,
  song,
  songKey,
  position,
}) => {
  const { userMembership } = useUserQuery();

  if (!userMembership) {
    return null;
  }

  const { data: setSectionData } = api.setSection.get.useQuery({
    setSectionId: selectedSetSection,
    organizationId: userMembership.organizationId,
  });

  // TODO: figure out better handling
  if (!setSectionData) {
    return null;
  }

  const setSectionSongs = setSectionData.songs.map((setSectionSong) => ({
    id: setSectionSong.id,
    songKey: setSectionSong.key,
    name: setSectionSong.song.name,
    index: setSectionSong.position,
    type: "existing",
  }));

  const setSectionSongsWithNewSong = setSectionSongs.toSpliced(position, 0, {
    id: song.id,
    name: song.name,
    index: position + 1,
    songKey: songKey,
    type: "new",
  });

  return (
    <VStack className="gap-4 p-6 pt-2">
      <VStack className="gap-4">
        <Text className="text-lg font-medium text-slate-900">
          Does this look right?
        </Text>
        <Card title={setSectionData.type.name} childrenClassName="md:py-4 px-3">
          <VStack className="gap-2">
            {/* TODO: de-emphasize the existing songs */}
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
      <Button>Add song to set</Button>
    </VStack>
  );
};
