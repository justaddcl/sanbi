import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { SongItem } from "@modules/SetListCard";
import { type NumberedSetSection } from "@modules/sets/utils/getSetSongNumbering";
import { type SetSectionWithSongs } from "@lib/types";

type SetSectionListProps = {
  /** The section data and computed display indexes for its songs */
  numberedSection: NumberedSetSection<SetSectionWithSongs>;
};

export const SetSectionList: React.FC<SetSectionListProps> = ({
  numberedSection,
}) => {
  const { section, songs: numberedSongs } = numberedSection;
  const { type, songs, setId } = section;
  return (
    <VStack className="gap-y-2">
      <div className="mb-1 border-b border-slate-100 pb-1">
        <Text>{type.name}</Text>
      </div>
      {songs &&
        songs.length > 0 &&
        numberedSongs.map(({ song: setSectionSong, displayIndex }) => (
          <SongItem
            key={setSectionSong.id}
            setSectionSong={setSectionSong}
            index={displayIndex}
            setId={setId}
            setSectionType={type.name}
            small
          />
        ))}
    </VStack>
  );
};
