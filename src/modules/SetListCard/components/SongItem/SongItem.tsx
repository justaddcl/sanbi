import { HStack } from "@components/HStack";
import { SongKey, type SongKeyProps } from "@components/SongKey";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";

export type SongItemProps = {
  /** index of song in the set list */
  index: number;

  /** what key the song will be played in */
  songKey: SongKeyProps["songKey"];

  /** name of song */
  name: string;

  /** song notes */
  notes?: string | null;
};

export const SongItem: React.FC<SongItemProps> = ({
  index,
  songKey,
  name,
  notes,
}) => {
  return (
    <HStack className="flex items-center gap-3 rounded-lg px-6 py-3 text-xs font-semibold shadow">
      <Text
        style="header-medium-semibold"
        align="right"
        className="text-slate-400"
      >
        {index}.
      </Text>
      <VStack className="flex flex-col gap-2">
        <HStack className="flex items-center gap-2">
          <SongKey songKey={songKey} />
          <Text fontWeight="semibold" className="text-sm">
            {name}
          </Text>
        </HStack>
        {notes ? (
          <Text style="small" color="slate-700">
            {notes}
          </Text>
        ) : null}
      </VStack>
    </HStack>
  );
};
