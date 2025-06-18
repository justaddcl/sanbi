import { useState } from "react";
import { type inferProcedureOutput } from "@trpc/server";

import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { type DraggableSongItem } from "@modules/shared/components/DraggableSongItem/DraggableSongItem";
import { DraggableSongList } from "@modules/shared/components/DraggableSongList/DraggableSongList";
import { useUserQuery } from "@modules/users/api/queries";
import { type AppRouter } from "@server/api/root";
import { api } from "@/trpc/react";

export type DraggableSongListItem = DraggableSongItem & {
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
      songKey: song.preferredKey,
      name: song.name,
      index: setSectionData.songs.length + 1,
      type: "new",
    },
  );

  return (
    <VStack className="gap-4 p-4 pt-2">
      {/* <VStack className="gap-1">
        <Text className="font-medium text-slate-700">Selected set</Text>
        <HStack className="items-center justify-between rounded-lg border border-slate-200 p-3">
          <VStack>
            <Text className="font-medium md:text-lg">
              {formatFriendlyDate(setData.date)}
            </Text>
            <Text className="text-sm text-slate-500">
              {setData.eventType.name}
            </Text>
          </VStack>
          <Badge variant="secondary">
            {`${setSectionsCount} ${pluralize(setSectionsCount, { singular: "section", plural: "sections" })}`}
          </Badge>
        </HStack>
      </VStack> */}
      <VStack className="gap-2">
        <Text className="text-lg font-medium text-slate-900">
          When in the section will you play {song.name}?
        </Text>
        <DraggableSongList
          songs={draggableSongItemsWithNewSong}
          onDragEnd={(songItems) => {
            setSelectedPosition(
              songItems.findIndex((songItem) => songItem.id === song.id),
            );
          }}
        />
      </VStack>
    </VStack>
  );
};
