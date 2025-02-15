"use client";

import { HStack } from "@components/HStack";
import { SongActionMenu } from "../SongActionMenu/SongActionMenu";
import { type SetSectionSongWithSongData } from "@lib/types";
import { type SetSectionCardProps } from "@modules/sets/components/SetSectionCard";
import { SongContent } from "@modules/SetListCard/components/SongContent";

type BaseSongItemProps = {
  /** set section song object */
  setSectionSong: SetSectionSongWithSongData;

  /** ID of the set this set section song is attached to  */
  setId: string;

  /** index of song in the set list */
  index: number;

  /** the type of set section this song is attached to */
  setSectionType: string;

  /** should the song item show the action menu? */
  withActionsMenu?: boolean;
};

export type SongItemWithActionsMenuProps = BaseSongItemProps & {
  withActionsMenu: true;

  /** is this song in the first section of the set? */
  isInFirstSection: SetSectionCardProps["isFirstSection"];

  /** is this song in the last section of the set? */
  isInLastSection: SetSectionCardProps["isLastSection"];

  /** is this song the first song of the section? */
  isFirstSong: boolean;

  /** is this song the last song of the section? */
  isLastSong: boolean;
};

type SongItemWithoutActionsMenuProps = BaseSongItemProps & {
  withActionsMenu?: false;
};

export type SongItemProps =
  | SongItemWithActionsMenuProps
  | SongItemWithoutActionsMenuProps;

export const SongItem: React.FC<SongItemProps> = ({
  setSectionSong,
  setId,
  index,
  setSectionType,
  ...props
}) => {
  return (
    <HStack className="items-center justify-between rounded-lg px-6 py-3 shadow lg:py-4">
      <SongContent setSectionSong={setSectionSong} index={index} />
      {props.withActionsMenu && (
        <SongActionMenu
          setSectionSong={setSectionSong}
          setId={setId}
          setSectionType={setSectionType}
          isFirstSong={props.isFirstSong}
          isLastSong={props.isLastSong}
          isInFirstSection={props.isInFirstSection}
          isInLastSection={props.isInLastSection}
        />
      )}
    </HStack>
  );
};
