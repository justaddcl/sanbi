import { type FC } from "react";
import { type SetSectionWithSongs } from "@lib/types";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { SongItem } from "@modules/SetListCard";
import { Text } from "@components/Text";
import { Button } from "@components/ui/button";
import { VStack } from "@components/VStack";
import { HStack } from "@components/HStack";
import { SetSectionActionMenu } from "@modules/SetListCard/components/SetSectionActionMenu";

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
  const { id, type, songs, setId, position } = section;
  const isFirstSection = position === 0;
  const isLastSection = position === setSectionsLength - 1;

  return (
    <VStack
      key={id}
      className="gap-4 rounded-lg border p-4 shadow lg:gap-8 lg:p-8"
    >
      <VStack as="header" className="gap-4 lg:gap-6">
        <HStack className="items-center justify-between gap-4 lg:gap-16">
          <Text
            asElement="h3"
            style="header-medium-semibold"
            className="flex-wrap text-xl"
          >
            {type.name}
          </Text>
          <HStack className="flex gap-2 self-center">
            <Button size="sm" variant="outline">
              <Plus className="text-slate-900" size={16} />
              <span className="hidden sm:inline">Add song</span>
            </Button>
            {withActionsMenu && (
              <SetSectionActionMenu
                setSection={section}
                setSectionsLength={setSectionsLength}
                isInFirstSection={isFirstSection}
                isInLastSection={isLastSection}
              />
            )}
            {/* <Button size="sm" variant="ghost">
              <DotsThree className="text-slate-900" size={16} />
            </Button> */}
          </HStack>
        </HStack>
        <hr className="bg-slate-100" />
      </VStack>
      <VStack className="gap-y-4">
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
      </VStack>
    </VStack>
  );
};
