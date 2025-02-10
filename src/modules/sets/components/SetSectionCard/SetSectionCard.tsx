import { type FC } from "react";
import { type SetSectionWithSongs } from "@lib/types";
import { DotsThree, Plus } from "@phosphor-icons/react/dist/ssr";
import { SongItem } from "@modules/SetListCard";
import { Text } from "@components/Text";
import { Button } from "@components/ui/button";
import { VStack } from "@components/VStack";
import { HStack } from "@components/HStack";

export type SetSectionProps = {
  section: SetSectionWithSongs;
  sectionStartIndex: number;
};

export const SetSectionCard: FC<SetSectionProps> = ({
  section,
  sectionStartIndex,
}) => {
  const { id, type, songs, setId } = section;
  return (
    <VStack
      key={id}
      className="gap-4 rounded-lg border p-4 shadow lg:gap-8 lg:p-8"
    >
      <VStack as="header" className="gap-4 lg:gap-6">
        <HStack className="items-center justify-between gap-4 lg:gap-16">
          <Text
            asElement="h3"
            style="header-medium-semibold"
            className="flex-wrap text-xl"
          >
            {type.name}
          </Text>
          <HStack className="flex gap-2 self-center">
            <Button size="sm" variant="outline">
              <Plus className="text-slate-900" size={16} />
              <span className="hidden sm:inline">Add song</span>
            </Button>
            <Button size="sm" variant="ghost">
              <DotsThree className="text-slate-900" size={16} />
            </Button>
          </HStack>
        </HStack>
        <hr className="bg-slate-100" />
      </VStack>
      <VStack className="gap-y-4">
        {songs &&
          songs.length > 0 &&
          section.songs.map((setSectionSong) => (
            <SongItem
              key={setSectionSong.id}
              setSectionSong={setSectionSong}
              index={sectionStartIndex + setSectionSong.position}
              setId={setId}
            />
          ))}
      </VStack>
    </VStack>
  );
};
