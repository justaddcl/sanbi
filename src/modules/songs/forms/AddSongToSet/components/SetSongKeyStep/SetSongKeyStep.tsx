import type React from "react";
import { ClockCounterClockwise, Heart } from "@phosphor-icons/react";

import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { useUserQuery } from "@modules/users/api/queries";
import { type SongKey, songKeys } from "@lib/constants";
import { formatSongKey } from "@lib/string/formatSongKey";
import { cn } from "@lib/utils";
import { useResponsive } from "@/hooks/useResponsive";
import { api } from "@/trpc/react";

type SetSongKeyStepProps = {
  songId: string;
  preferredKey: SongKey;
  onKeySelect: (selectedKey: SongKey) => void;
};

export const SetSongKeyStep: React.FC<SetSongKeyStepProps> = ({
  songId,
  preferredKey,
  onKeySelect,
}) => {
  const { textSize, isDesktop } = useResponsive();

  const {
    data: userData,
    isLoading: isUserQueryLoading,
    isAuthLoaded,
    userMembership,
  } = useUserQuery();

  const { data: lastPlayInstance, isLoading: isLastPlayInstanceQueryLoading } =
    api.song.getLastPlayInstance.useQuery(
      {
        organizationId: userMembership?.organizationId ?? "",
        songId,
      },
      {
        enabled: !!userMembership?.organizationId,
      },
    );

  // TODO: how do we properly handle this case?
  if (!userMembership) {
    return null;
  }

  return (
    <VStack className="gap-4 p-6 pt-2">
      <VStack className="gap-4">
        <Text className="text-lg font-medium text-slate-900">Select a key</Text>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-6">
          {songKeys.map((key) => (
            <Button
              key={key}
              variant="outline"
              className={cn({
                // TODO: update colors when brand colors are decided on
                "border-red-300": key === preferredKey,
                "border-blue-300": key === lastPlayInstance?.song.key,
              })}
              onClick={() => {
                onKeySelect(key);
              }}
            >
              {formatSongKey(key)}
            </Button>
          ))}
        </div>
        <VStack className=" gap-2 text-slate-500">
          <HStack className="items-center gap-1">
            <Heart />
            <Text style={isDesktop ? "body-small" : "small"}>
              Preferred key: {formatSongKey(preferredKey)}
            </Text>
          </HStack>
          {isLastPlayInstanceQueryLoading && <Skeleton className="h-4 w-40" />}
          {!isLastPlayInstanceQueryLoading && lastPlayInstance?.song.key && (
            <HStack className=" items-center gap-1">
              <ClockCounterClockwise />
              <HStack className="items-center">
                <Text style={isDesktop ? "body-small" : "small"}>
                  Last played:
                </Text>
                <Text
                  style={isDesktop ? "body-small" : "small"}
                  className="ml-1"
                >
                  {formatSongKey(lastPlayInstance.song.key)}
                </Text>
              </HStack>
            </HStack>
          )}
        </VStack>
      </VStack>
    </VStack>
  );
};
