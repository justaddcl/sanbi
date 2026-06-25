import { type FC, useState } from "react";

import { Card } from "@components/Card/Card";
import { VStack } from "@components/VStack";
import { SongItem } from "@modules/SetListCard";
import { type NumberedSetSection } from "@modules/sets/utils/getSetSongNumbering";
import { type SetSectionWithSongs } from "@lib/types";

import { EditSetSectionTypeForm } from "../forms/EditSetSectionTypeForm";

export type SetSectionCardSectionProps = {
  /** The section data including songs, type, and position */
  section: SetSectionWithSongs;

  /** how many set sections are in the set this section is attached to */
  setSectionsLength: number;

  /** should the SetSection card have the action menu? */
  withActionsMenu?: boolean;
};

export type SetSectionCardProps = Omit<
  SetSectionCardSectionProps,
  "section"
> & {
  /** The section data and computed display indexes for its songs */
  numberedSection: NumberedSetSection<SetSectionCardSectionProps["section"]>;

  /** Opens the add-song dialog scoped to this section. */
  onAddSongClick?: () => void;
};

export const SetSectionCard: FC<SetSectionCardProps> = ({
  numberedSection,
  setSectionsLength,
  withActionsMenu,
  onAddSongClick,
}) => {
  const { section, songs: numberedSongs } = numberedSection;
  const { type, songs, setId, position } = section;

  const isFirstSection = position === 0;
  const isLastSection = position === setSectionsLength - 1;

  const [isSectionExpanded, setIsSectionExpanded] = useState<boolean>(true);

  return (
    <div data-testid="set-section-card">
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
            onAddSongClick={onAddSongClick}
          />
        }
      >
        <VStack className="gap-1">
          {songs &&
            songs.length > 0 &&
            numberedSongs.map(({ song: setSectionSong, displayIndex }) => (
              <SongItem
                key={setSectionSong.id}
                setSectionSong={setSectionSong}
                index={displayIndex}
                setId={setId}
                setSectionType={type.name}
                isInFirstSection={isFirstSection}
                isInLastSection={isLastSection}
                isFirstSong={setSectionSong.position === 0}
                isLastSong={
                  setSectionSong.position === section.songs.length - 1
                }
                withActionsMenu
              />
            ))}
        </VStack>
      </Card>
    </div>
  );
};
