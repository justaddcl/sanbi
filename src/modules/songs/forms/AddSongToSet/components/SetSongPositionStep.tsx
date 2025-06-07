import { type inferProcedureOutput } from "@trpc/server";

import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { SongContent } from "@modules/SetListCard/components/SongContent";
import { useUserQuery } from "@modules/users/api/queries";
import { type AppRouter } from "@server/api/root";
import { api } from "@/trpc/react";

type SetSongPositionStepProps = {
  selectedSetSection: string | null;
  song: inferProcedureOutput<AppRouter["song"]["get"]>;
  onSongPositionSet: (songPosition: number) => void;
};

export const SetSongPositionStep: React.FC<SetSongPositionStepProps> = ({
  selectedSetSection,
  song,
  onSongPositionSet,
}) => {
  const { userMembership } = useUserQuery();

  if (!selectedSetSection || !userMembership) {
    return null;
  }

  const { data: setSectionData } = api.setSection.get.useQuery({
    setSectionId: selectedSetSection,
    organizationId: userMembership.organizationId,
  });

  // FIXME: how do we handle this case?
  if (!setSectionData) {
    return null;
  }

  return (
    <VStack className="gap-4 p-4 pt-2">
      {/* <VStack className="gap-1">
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
      </VStack> */}
      <VStack className="gap-2">
        <Text className="text-lg font-medium text-slate-900">
          When in the section will you play {song.name}?
        </Text>
        <VStack className="gap-2">
          {setSectionData.songs &&
            setSectionData.songs.length > 0 &&
            setSectionData.songs.map((setSectionSong, songPosition) => (
              <SongContent
                key={setSectionSong.id}
                setSectionSong={setSectionSong}
                index={songPosition + 1}
              />
            ))}
        </VStack>
      </VStack>
    </VStack>
  );
};
