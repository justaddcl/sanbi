"use client";

import type React from "react";
import { formatDistanceToNow, isFuture } from "date-fns";

import { Skeleton } from "@components/ui/skeleton";
import { Card } from "@components/Card/Card";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { PlayHistoryItem } from "@modules/SetListCard";
import { ArchivedBanner } from "@modules/shared/components";
import {
  SongDetailsPageHeader,
  SongDetailsPageLoading,
  SongNotes,
} from "@modules/songs/components";
import { SongDetailsItem } from "@modules/songs/components/SongDetailsItem/SongDetailsItem";
import { SongKeySelect } from "@modules/songs/components/SongKeySelect/SongKeySelect";
import { SongResources } from "@modules/songs/components/SongResources";
import { SongTags } from "@modules/songs/components/SongTags/SongTags";
import { trpc } from "@lib/trpc";
import { type OrganizationMembershipWithOrganization } from "@lib/types";

type SongDetailsPageProps = {
  songId: string;
  organizationId: string;
  userMembership: OrganizationMembershipWithOrganization;
};

const PlayHistoryLoadingRows = () => (
  <>
    <Skeleton className="size-2 rounded-full" />
    <VStack className="gap-1">
      <Skeleton className="h-3 w-56" />
      <Skeleton className="h-3 w-40" />
    </VStack>
    <Skeleton className="size-2 rounded-full" />
    <VStack className="gap-1">
      <Skeleton className="h-3 w-44" />
      <Skeleton className="h-3 w-36" />
    </VStack>
  </>
);

export const SongDetailsPage: React.FC<SongDetailsPageProps> = ({
  songId,
  organizationId,
  userMembership,
}) => {
  const {
    data: song,
    isPending: isSongPending,
    error: songQueryError,
  } = trpc.song.get.useQuery({
    songId,
    organizationId,
  });

  const {
    data: playHistory,
    isPending: isPlayHistoryPending,
    isError: isPlayHistoryError,
  } = trpc.song.getPlayHistory.useQuery({
    songId,
    organizationId,
  });

  if (isSongPending) {
    return <SongDetailsPageLoading />;
  }

  if (songQueryError ?? !song) {
    // TODO: add error handling for song not found
    return;
  }

  const dateFormatter = new Intl.DateTimeFormat("en-US");

  const hasPlayHistory = !!playHistory?.length;
  const lastPlayInstance = playHistory?.find(
    (playInstance) => !isFuture(new Date(playInstance.set.date)),
  );

  return (
    <>
      <SongDetailsPageHeader song={song} userMembership={userMembership} />
      {song?.isArchived && <ArchivedBanner itemType="song" songId={song.id} />}
      <Card title="Song details" collapsible>
        <VStack as="dl" className="gap-4 md:gap-6">
          <SongDetailsItem icon="MusicNoteSimple" label="Preferred Key">
            <dd>
              <SongKeySelect
                songId={song.id}
                preferredKey={song.preferredKey}
                userMembership={userMembership}
              />
            </dd>
          </SongDetailsItem>
          <SongDetailsItem icon="ClockCounterClockwise" label="Last Played">
            <dd>
              {isPlayHistoryPending ? (
                <Text style="body-small" className="text-slate-700">
                  Loading play history
                </Text>
              ) : isPlayHistoryError ? (
                <Text style="body-small" className="text-slate-700">
                  Play history is unavailable
                </Text>
              ) : lastPlayInstance ? (
                <HStack className="flex-wrap gap-1 leading-5">
                  <Text
                    asElement="span"
                    style="body-small"
                    className="text-slate-700"
                  >
                    {formatDistanceToNow(lastPlayInstance.set.date, {
                      addSuffix: true,
                      includeSeconds: false,
                    })}
                  </Text>
                  <Text
                    asElement="span"
                    style="body-small"
                    className="text-slate-500"
                  >
                    for
                  </Text>
                  <Text
                    asElement="span"
                    style="body-small"
                    className="text-slate-700"
                  >
                    {lastPlayInstance?.set.eventType}
                  </Text>
                </HStack>
              ) : hasPlayHistory ? (
                <Text style="body-small" className="text-slate-700">
                  Scheduled for future sets only
                </Text>
              ) : (
                <Text style="body-small" className="text-slate-700">
                  Not used in a set yet
                </Text>
              )}
            </dd>
          </SongDetailsItem>
          <SongDetailsItem icon="Tag" label="Tags">
            <SongTags songId={song.id} organizationId={organizationId} />
          </SongDetailsItem>
          <SongNotes songId={song.id} organizationId={organizationId} />
        </VStack>
      </Card>
      <SongResources
        songId={songId}
        songName={song.name}
        organizationId={organizationId}
      />
      <Card title="Play history" collapsible>
        <div className="grid grid-cols-[16px_1fr] gap-y-4">
          {isPlayHistoryPending && (
            <PlayHistoryLoadingRows />
          )}
          {isPlayHistoryError && (
            <div className="col-span-2 rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-4">
              <Text style="body-small" className="text-slate-700">
                Play history is unavailable right now. Try refreshing the page.
              </Text>
            </div>
          )}
          {!isPlayHistoryPending &&
            !isPlayHistoryError &&
            playHistory &&
            playHistory.length > 0 &&
            playHistory.map((playInstance) => (
              <PlayHistoryItem
                key={`${playInstance.set.id}-${playInstance.section.position}`}
                date={dateFormatter.format(new Date(playInstance.set.date))}
                eventType={playInstance.set.eventType}
                songKey={playInstance.song.key}
                setSection={playInstance.section.typeName}
                setId={playInstance.set.id}
              />
            ))}
          <PlayHistoryItem date={dateFormatter.format(song.createdAt)} />
        </div>
      </Card>
    </>
  );
};
