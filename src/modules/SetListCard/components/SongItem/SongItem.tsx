import { HStack } from "@components/HStack";
import { SongKey, type SongKeyProps } from "@components/SongKey";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { SongActionMenu } from "../SongActionMenu/SongActionMenu";

export type SongItemProps = {
  /** index of song in the set list */
  index: number;

  /** what key the song will be played in */
  songKey: SongKeyProps["songKey"];

  /** name of song */
  name: string;

  /** song notes */
  notes?: string | null;

  /** should the song item show the action menu? */
  withActionsMenu?: boolean;
};

export const SongItem: React.FC<SongItemProps> = ({
  index,
  songKey,
  name,
  notes,
  withActionsMenu = true,
}) => {
  return (
    <HStack className="items-center justify-between rounded-lg px-6 py-3 shadow lg:py-4">
      <HStack className="items-baseline gap-3 text-xs font-semibold">
        <Text
          style="header-medium-semibold"
          align="right"
          className="text-slate-400"
        >
          {index}.
        </Text>
        <VStack className="flex flex-col gap-2">
          <HStack className="flex items-baseline gap-2">
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
      {withActionsMenu && <SongActionMenu />}
    </HStack>
  );
};
