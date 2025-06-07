import unescapeHTML from "validator/es/lib/unescape";

import { HStack } from "@components/HStack";
import { SongKey } from "@components/SongKey";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { type SetSectionSongWithSongData } from "@lib/types";

export type SongContentProps = {
  /** The set section song object containing song details and metadata */
  setSectionSong: SetSectionSongWithSongData;

  /** The 1-based index position of this song in the overall set list */
  index: number;
};

/**
 * Displays the core content of a song item including index number, key, title and notes
 * Used as an internal component within SongItem
 */
export const SongContent: React.FC<SongContentProps> = ({
  setSectionSong,
  index,
}) => {
  return (
    <HStack className="w-full items-baseline gap-3 text-xs font-semibold">
      <Text
        style="header-medium-semibold"
        align="right"
        className="text-slate-400"
      >
        {index}.
      </Text>
      <VStack className="flex flex-grow flex-col gap-4">
        <HStack className="flex items-baseline gap-2">
          <SongKey songKey={setSectionSong.key} />
          <Text fontWeight="semibold" className="text-sm">
            {setSectionSong.song.name}
          </Text>
        </HStack>
        {setSectionSong.notes ? (
          <Text style="small" color="slate-700">
            {unescapeHTML(setSectionSong.notes)}
          </Text>
        ) : null}
      </VStack>
    </HStack>
  );
};
