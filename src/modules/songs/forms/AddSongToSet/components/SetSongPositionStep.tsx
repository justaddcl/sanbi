import { useEffect, useState } from "react";
import { type inferProcedureOutput } from "@trpc/server";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Card } from "@components/Card/Card";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { type DraggableSongItem } from "@modules/shared/components/DraggableSongItem/DraggableSongItem";
import { DraggableSongList } from "@modules/shared/components/DraggableSongList/DraggableSongList";
import { useUserQuery } from "@modules/users/api/queries";
import { clamp } from "@lib/numbers";
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
  onSongPositionSet: (orderedSongIds: string[]) => void;
};

export const SetSongPositionStep: React.FC<SetSongPositionStepProps> = ({
  selectedSetSection,
  song,
  newSongInitialPosition,
  onSongPositionSet,
}) => {
  const [inputPositionValue, setInputPositionValue] = useState(
    newSongInitialPosition,
  );
  const [songItems, setSongItems] = useState<DraggableSongListItem[]>([]);

  const { userMembership } = useUserQuery();

  const { data: setSectionData } = api.setSection.get.useQuery(
    {
      setSectionId: selectedSetSection!,
      organizationId: userMembership!.organizationId,
    },
    {
      enabled: !!selectedSetSection && !!userMembership,
    },
  );

  useEffect(() => {
    if (!setSectionData) {
      return;
    }

    const existingItems: DraggableSongListItem[] = setSectionData.songs.map(
      (song) => ({
        id: song.id,
        songKey: song.key,
        name: song.song.name,
        index: song.position,
        type: "existing",
      }),
    );

    const songPosition = clamp(inputPositionValue, {
      min: 0,
      max: existingItems.length,
    });

    const newSongItem: DraggableSongListItem = {
      id: song.id,
      name: song.name,
      index: existingItems.length,
      type: "new",
    };

    setSongItems(existingItems.toSpliced(songPosition, 0, newSongItem));
  }, [inputPositionValue, setSectionData, song]);

  if (!selectedSetSection || !userMembership) {
    return null;
  }

  // FIXME: how do we handle this case?
  if (!setSectionData) {
    return null;
  }

  return (
    <VStack className="gap-4 p-6 pt-2">
      <VStack className="gap-4">
        <HStack className="justify-between">
          <Text className="text-lg font-medium text-slate-900">
            Set song position
          </Text>
          <HStack className="items-center gap-2">
            <Input
              type="number"
              value={inputPositionValue + 1}
              className="max-w-14 p-2"
              onChange={(changeEvent) => {
                const parsedInput = Number.parseInt(changeEvent.target.value);

                // Allow clearing the field, default to the end position
                if (
                  Number.isNaN(parsedInput) ||
                  changeEvent.target.value === ""
                ) {
                  setInputPositionValue(setSectionData.songs.length);
                  return;
                }

                setInputPositionValue(
                  clamp(parsedInput - 1, {
                    min: 0,
                    max: setSectionData.songs.length, // This should match useEffect clamping
                  }),
                );
              }}
            />
            <Text> of {setSectionData.songs.length + 1}</Text>
          </HStack>
        </HStack>
        <Card title={setSectionData.type.name} childrenClassName="md:py-4 px-3">
          <DraggableSongList
            songs={songItems}
            onDragEnd={(songItems) => {
              const songPosition = songItems.findIndex(
                (songItem) => songItem.id === song.id,
              );
              setInputPositionValue(songPosition);
            }}
          />
        </Card>
      </VStack>
      <Button
        onClick={() => {
          const orderedSongIds = songItems.map((songItem) => songItem.id);
          onSongPositionSet(orderedSongIds);
        }}
      >
        Confirm song position
      </Button>
    </VStack>
  );
};
