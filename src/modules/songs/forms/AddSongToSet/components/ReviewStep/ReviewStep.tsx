import { VStack } from "@components/VStack";
import { SongKey } from "@lib/constants";
import { SongContent } from "@modules/SetListCard/components/SongContent";
import React from "react";
import { Text } from "@components/Text";
import { Button } from "@components/ui/button";
import { useUserQuery } from "@modules/users/api/queries";
import { api } from "@/trpc/react";
import { Card } from "@components/Card/Card";
import { cn } from "@lib/utils";
import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "@server/api/root";

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
                disabled={song.type === "existing"}
              />
            ))}
          </VStack>
        </Card>
      </VStack>
      <Button>Add song to set</Button>
    </VStack>
  );
};
