import type React from "react";

import { Button } from "@components/ui/button";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { type SongKey, songKeys } from "@lib/constants";
import { formatSongKey } from "@lib/string/formatSongKey";
import {
  CircleNotch,
  ClockCounterClockwise,
  Heart,
} from "@phosphor-icons/react";
import { HStack } from "@components/HStack";
import { useResponsive } from "@/hooks/useResponsive";
import { api } from "@/trpc/react";
import { Skeleton } from "@components/ui/skeleton";
import { useUserQuery } from "@modules/users/api/queries";
import { cn } from "@lib/utils";

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

  // TODO: how do we properly handle this case?
  if (!userMembership) {
    return null;
  }

  const { data: lastPlayInstance, isLoading: isLastPlayInstanceQueryLoading } =
    api.song.getLastPlayInstance.useQuery({
      organizationId: userMembership.organizationId,
      songId,
    });

  return (
    <VStack className="gap-4 p-6 pt-2">
      <VStack className="gap-4">
        <Text className="text-lg font-medium text-slate-900">
          What key will you play in?
        </Text>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-6">
          {songKeys.map((key) => (
            <Button
              key={key}
              variant="outline"
              className={cn({
                // FIXME: update colors
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
              {/* used the non-null assertion since all songs should have a selected key */}
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
