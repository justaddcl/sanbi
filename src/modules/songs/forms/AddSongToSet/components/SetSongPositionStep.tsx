import { useState } from "react";
import { type inferProcedureOutput } from "@trpc/server";

import { Button } from "@components/ui/button";
import { Card } from "@components/Card/Card";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { type DraggableSongItem } from "@modules/shared/components/DraggableSongItem/DraggableSongItem";
import { DraggableSongList } from "@modules/shared/components/DraggableSongList/DraggableSongList";
import { useUserQuery } from "@modules/users/api/queries";
import { type AppRouter } from "@server/api/root";
import { api } from "@/trpc/react";

export type DraggableSongListItem = Omit<DraggableSongItem, "songKey"> &
  Partial<Pick<DraggableSongItem, "songKey">> & {
    type: "new" | "existing";
  };

type SetSongPositionStepProps = {
  selectedSetSection: string | null;
  song: inferProcedureOutput<AppRouter["song"]["get"]>;
  newSongInitialPosition: number;
  onSongPositionSet: (songPosition: number) => void;
};

export const SetSongPositionStep: React.FC<SetSongPositionStepProps> = ({
  selectedSetSection,
  song,
  newSongInitialPosition,
  onSongPositionSet,
}) => {
  const [selectedPosition, setSelectedPosition] = useState<number>(
    newSongInitialPosition,
  );
  const { userMembership } = useUserQuery();

  if (!selectedSetSection || !userMembership) {
    return null;
  }

  const { data: setSectionData } = api.setSection.get.useQuery({
    setSectionId: selectedSetSection,
    organizationId: userMembership.organizationId,
  });

  // FIXME: how do we handle this case?
  if (!setSectionData) {
    return null;
  }

  const draggableSongItems: DraggableSongListItem[] = setSectionData.songs.map(
    (setSectionSong) => ({
      id: setSectionSong.id,
      songKey: setSectionSong.key,
      name: setSectionSong.song.name,
      index: setSectionSong.position,
      type: "existing",
    }),
  );

  const draggableSongItemsWithNewSong = draggableSongItems.toSpliced(
    newSongInitialPosition,
    0,
    {
      id: song.id,
      name: song.name,
      index: setSectionData.songs.length + 1,
      type: "new",
    },
  );

  return (
    <VStack className="gap-4 p-6 pt-2">
      <VStack className="gap-4">
        <Text className="text-lg font-medium text-slate-900">
          Set song position
        </Text>
        <Card title={setSectionData.type.name} childrenClassName="md:py-4 px-3">
          <DraggableSongList
            songs={draggableSongItemsWithNewSong}
            onDragEnd={(songItems) => {
              setSelectedPosition(
                songItems.findIndex((songItem) => songItem.id === song.id),
              );
            }}
          />
        </Card>
      </VStack>
      <Button
        onClick={() => {
          onSongPositionSet(selectedPosition);
        }}
      >
        Confirm song position
      </Button>
    </VStack>
  );
};
