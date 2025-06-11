import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card } from "@components/Card/Card";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { SongContent } from "@modules/SetListCard/components/SongContent";
import { type SelectedSet } from "@modules/songs/forms/AddSongToSet/components/AddSongToSetDialog";
import { formatFriendlyDate } from "@modules/songs/forms/AddSongToSet/components/SetSelectionUpcomingSets";
import { useUserQuery } from "@modules/users/api/queries";
import { pluralize } from "@lib/string";
import { api } from "@/trpc/react";

type SetSectionSelectionStepProps = {
  selectedSet: SelectedSet | null;
  onSelectSetSection: (setSectionId: string) => void;
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

  // FIXME: how do we handle this case?
  if (!setData) {
    return null;
  }

  const setSectionsCount = setData.sections.length;

  return (
    <VStack className="gap-4 p-4 pt-2">
      <VStack className="gap-1">
        <Text className="font-medium text-slate-700">Selected set</Text>
        <HStack className="items-center justify-between rounded-lg border border-slate-200 p-3">
          <VStack>
            <Text className="font-medium md:text-lg">
              {formatFriendlyDate(setData.date)}
            </Text>
            <Text className="text-sm text-slate-500">
              {setData.eventType.name}
            </Text>
          </VStack>
          <Badge variant="secondary">
            {`${setSectionsCount} ${pluralize(setSectionsCount, { singular: "section", plural: "sections" })}`}
          </Badge>
        </HStack>
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
              headerClassName="px-3 py-1"
              badge={
                <Button
                  size="sm"
                  onClick={(clickEvent) => {
                    clickEvent.stopPropagation();
                    onSelectSetSection(section.id);
                  }}
                >
                  <span className="md:hidden">Select</span>
                  <span className="hidden md:inline">Select section</span>
                </Button>
              }
              badgeAlignEnd
              collapsible
              initialIsExpanded={false}
            >
              <VStack className="gap-2">
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
