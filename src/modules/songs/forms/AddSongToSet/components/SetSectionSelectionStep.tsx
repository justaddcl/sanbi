import { Button } from "@components/ui/button";
import { Card } from "@components/Card/Card";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { SongContent } from "@modules/SetListCard/components/SongContent";
import { SelectedSetCard } from "@modules/songs/forms/AddSongToSet/components";
import { type SelectedSet } from "@modules/songs/forms/AddSongToSet/components/AddSongToSetDialog";
import { useUserQuery } from "@modules/users/api/queries";
import { api } from "@/trpc/react";

type SetSectionSelectionStepProps = {
  selectedSet: SelectedSet | null;
  onSelectSetSection: (
    setSectionId: string,
    setSectionSongCount: number,
  ) => void;
};

export const SetSectionSelectionStep: React.FC<
  SetSectionSelectionStepProps
> = ({ selectedSet, onSelectSetSection }) => {
  const { userMembership } = useUserQuery();

  if (!selectedSet || !userMembership) {
    return null;
  }

  const { data: setData } = api.set.get.useQuery({
    setId: selectedSet.id,
    organizationId: userMembership.organizationId,
  });

  if (!setData) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Unable to load set details. Please go back a step and try re-selecting
        the set.
      </div>
    );
  }

  return (
    <VStack className="gap-4 p-4 pt-2">
      <VStack className="gap-1">
        <Text className="font-medium text-slate-700">Selected set</Text>
        <SelectedSetCard set={setData} />
      </VStack>
      <VStack className="gap-2">
        <Text className="text-lg font-medium text-slate-900">
          Select a section
        </Text>
        <VStack className="gap-4">
          {setData.sections.map((section) => (
            <Card
              key={section.id}
              title={section.type.name}
              headerClassName="p-0"
              titleClassName="md:text-lg"
              button={
                <Button
                  size="sm"
                  onClick={(clickEvent) => {
                    clickEvent.stopPropagation();
                    onSelectSetSection(section.id, section.songs.length);
                  }}
                >
                  <span className="md:hidden">Select</span>
                  <span className="hidden md:inline">Select section</span>
                </Button>
              }
              collapsible
              initialIsExpanded={false}
            >
              <VStack className="gap-3 md:gap-4">
                {section.songs &&
                  section.songs.length > 0 &&
                  section.songs.map((setSectionSong, songPosition) => (
                    <SongContent
                      key={setSectionSong.id}
                      songKey={setSectionSong.key}
                      name={setSectionSong.song.name}
                      notes={setSectionSong.notes}
                      index={songPosition + 1}
                    />
                  ))}
              </VStack>
            </Card>
          ))}
        </VStack>
      </VStack>
    </VStack>
  );
};
