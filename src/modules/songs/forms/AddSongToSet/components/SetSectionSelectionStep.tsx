import { CaretDown, CaretUp } from "@phosphor-icons/react";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card } from "@components/Card/Card";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { type SelectedSet } from "@modules/songs/forms/AddSongToSet/components/AddSongToSetDialog";
import { formatFriendlyDate } from "@modules/songs/forms/AddSongToSet/components/SetSelectionUpcomingSets";
import { useUserQuery } from "@modules/users/api/queries";
import { pluralize } from "@lib/string";
import { api } from "@/trpc/react";

type SetSectionSelectionStepProps = {
  selectedSet: SelectedSet | null;
};

export const SetSectionSelectionStep: React.FC<
  SetSectionSelectionStepProps
> = ({ selectedSet }) => {
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

  return (
    <VStack className="gap-6 p-4">
      <HStack className="items-center justify-between rounded-lg border border-slate-200 p-2">
        <VStack>
          <Text className="font-medium">
            {formatFriendlyDate(setData.date)}
          </Text>
          <Text className="text-sm text-slate-500">
            {setData.eventType.name}
          </Text>
        </VStack>
        <Badge variant="secondary">
          {`${selectedSet.songCount} ${pluralize(selectedSet.songCount, { singular: "song", plural: "songs" })}`}
        </Badge>
      </HStack>
      <VStack className="gap-2">
        <Text className="font-medium text-slate-700">Set sections</Text>
        <VStack className="gap-4">
          {setData.sections.map((section) => (
            <Card
              key={section.id}
              // externalIsExpanded={isSectionExpanded}
              header={
                <HStack className="flex-wrap items-baseline justify-between gap-4 lg:gap-16 lg:pr-4">
                  <HStack className="gap-2 lg:gap-4">
                    <Text
                      asElement="h3"
                      style="header-medium-semibold"
                      className="text-l flex-wrap md:text-xl"
                    >
                      {section.type.name}
                    </Text>
                    {/* {!isExpanded ? (
                    <Badge variant="secondary">
                      <span>{section.songs.length}</span>
                      <span className="hidden md:ml-1 md:inline-block">
                        {pluralize(section.songs.length, {
                          singular: "song",
                          plural: "songs",
                        })}
                      </span>
                    </Badge>
                  ) : null} */}
                  </HStack>
                  <HStack className="flex items-start gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(clickEvent) => {
                        clickEvent.preventDefault();
                        // setIsExpanded((isExpanded) => !isExpanded);
                      }}
                    >
                      <CaretDown />
                      {/* {isExpanded ? <CaretUp /> : <CaretDown />} */}
                    </Button>
                  </HStack>
                </HStack>
              }
            >
              {section.songs &&
                section.songs.length > 0 &&
                section.songs.map((setSectionSong) => (
                  <HStack key={setSectionSong.id} className="gap-2">
                    <Text>{setSectionSong.position + 1}</Text>
                    <Text>{setSectionSong.song.name}</Text>
                    <Text>{setSectionSong.key}</Text>
                  </HStack>
                ))}
            </Card>
          ))}
        </VStack>
      </VStack>
    </VStack>
  );
};
