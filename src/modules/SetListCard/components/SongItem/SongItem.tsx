"use client";

import { HStack } from "@components/HStack";
import { SongKey } from "@components/SongKey";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { SongActionMenu } from "../SongActionMenu/SongActionMenu";
import { type SetSectionSongWithSongData } from "@lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";

export type SongItemProps = {
  /** set section song object */
  setSectionSong: SetSectionSongWithSongData;

  /** ID of the set this set section song is attached to  */
  setId: string;

  /** index of song in the set list */
  index: number;

  /** should the song item show the action menu? */
  withActionsMenu?: boolean;
};

export const SongItem: React.FC<SongItemProps> = ({
  setSectionSong,
  setId,
  index,
  withActionsMenu = true,
}) => {
  const params = useParams<{ organization: string }>();

  return (
    <HStack className="items-center justify-between rounded-lg px-6 py-3 shadow lg:py-4">
      <HStack className="w-full items-baseline gap-3 text-xs font-semibold">
        <Text
          style="header-medium-semibold"
          align="right"
          className="text-slate-400"
        >
          {index}.
        </Text>
        <VStack className="flex flex-grow flex-col gap-2">
          <HStack className="flex items-baseline gap-2">
            <SongKey songKey={setSectionSong.key} />
            <Link
              href={`/${params.organization}/songs/${setSectionSong.song.id}`}
              className="w-full"
            >
              <Text fontWeight="semibold" className="text-sm">
                {setSectionSong.song.name}
              </Text>
            </Link>
          </HStack>
          {setSectionSong.notes ? (
            <Text style="small" color="slate-700">
              {setSectionSong.notes}
            </Text>
          ) : null}
        </VStack>
      </HStack>
      {withActionsMenu && (
        <SongActionMenu setSectionSongId={setSectionSong.id} setId={setId} />
      )}
    </HStack>
  );
};
