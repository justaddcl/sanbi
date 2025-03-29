import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { type SetSectionWithSongs } from "@lib/types";
import { SongItem } from "@modules/SetListCard";

type SetSectionListProps = {
  /** The section data including songs, type, and position */
  section: SetSectionWithSongs;

  /** The 1-based index where this section's songs start in the overall set */
  sectionStartIndex: number;
};

export const SetSectionList: React.FC<SetSectionListProps> = ({
  section,
  sectionStartIndex,
}) => {
  const { type, songs, setId } = section;
  return (
    <VStack className="gap-y-2">
      <div className="mb-1 border-b border-slate-100 pb-1">
        <Text>{type.name}</Text>
      </div>
      {songs &&
        songs.length > 0 &&
        section.songs.map((setSectionSong) => (
          <SongItem
            key={setSectionSong.id}
            setSectionSong={setSectionSong}
            index={sectionStartIndex + setSectionSong.position}
            setId={setId}
            setSectionType={type.name}
            small
          />
        ))}
    </VStack>
  );
};
