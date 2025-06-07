import { type FC, useState } from "react";

import { Card } from "@components/Card/Card";
import { SongItem } from "@modules/SetListCard";
import { type SetSectionWithSongs } from "@lib/types";

import { EditSetSectionTypeForm } from "../forms/EditSetSectionTypeForm";

export type SetSectionCardProps = {
  /** The section data including songs, type, and position */
  section: SetSectionWithSongs;

  /** how many set sections are in the set this section is attached to */
  setSectionsLength: number;

  /** The 1-based index where this section's songs start in the overall set */
  sectionStartIndex: number;

  /** Whether this is the first section in the set */
  // isFirstSection: boolean;

  /** Whether this is the last section in the set */
  // isLastSection: boolean;

  /** should the SetSection card have the action menu? */
  withActionsMenu?: boolean;
};

export const SetSectionCard: FC<SetSectionCardProps> = ({
  section,
  setSectionsLength,
  sectionStartIndex,
  withActionsMenu,
}) => {
  const { type, songs, setId, position } = section;

  const isFirstSection = position === 0;
  const isLastSection = position === setSectionsLength - 1;

  const [isSectionExpanded, setIsSectionExpanded] = useState<boolean>(true);

  return (
    <Card
      externalIsExpanded={isSectionExpanded}
      header={
        <EditSetSectionTypeForm
          section={section}
          setSectionsLength={setSectionsLength}
          isExpanded={isSectionExpanded}
          setIsExpanded={setIsSectionExpanded}
          withActionsMenu={withActionsMenu}
          isFirstSection={isFirstSection}
          isLastSection={isLastSection}
        />
      }
    >
      {songs &&
        songs.length > 0 &&
        section.songs.map((setSectionSong) => (
          <SongItem
            key={setSectionSong.id}
            setSectionSong={setSectionSong}
            index={sectionStartIndex + setSectionSong.position}
            setId={setId}
            setSectionType={type.name}
            isInFirstSection={isFirstSection}
            isInLastSection={isLastSection}
            isFirstSong={setSectionSong.position === 0}
            isLastSong={setSectionSong.position === section.songs.length - 1}
            withActionsMenu
          />
        ))}
    </Card>
  );
};
