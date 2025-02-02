import { type FC } from "react";
import { type SetSectionWithSongs } from "@lib/types";
import { DotsThree, Plus } from "@phosphor-icons/react/dist/ssr";
import { SongItem } from "@modules/SetListCard";
import Link from "next/link";
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
  const { id, type, songs } = section;
  return (
    <VStack key={id} className="flex flex-col gap-4">
      <VStack as="header" className="flex flex-col gap-4">
        <HStack className="flex items-baseline justify-between">
          <Text asElement="h3" style="header-medium-semibold">
            {type.name}
          </Text>
          <HStack className="flex gap-2">
            <Button size="sm" variant="outline">
              <Plus className="text-slate-900" size={16} />
              Add song
            </Button>
            <Button size="sm" variant="outline">
              <DotsThree className="text-slate-900" size={16} />
            </Button>
          </HStack>
        </HStack>
        <hr className="bg-slate-100" />
      </VStack>
      <VStack className="gap-y-4">
        {songs &&
          songs.length > 0 &&
          section.songs.map((setSectionSong) => {
            return (
              <Link
                key={setSectionSong.songId}
                href={`../songs/${setSectionSong.songId}`}
              >
                <SongItem
                  index={sectionStartIndex + setSectionSong.position}
                  songKey={setSectionSong.key}
                  name={setSectionSong.song.name}
                  {...(setSectionSong.notes && {
                    notes: setSectionSong.notes,
                  })}
                />
              </Link>
            );
          })}
      </VStack>
    </VStack>
  );
};
