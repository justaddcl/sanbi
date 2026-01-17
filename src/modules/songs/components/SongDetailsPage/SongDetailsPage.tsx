"use client";

import type React from "react";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

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

export const SongDetailsPage: React.FC<SongDetailsPageProps> = ({
  songId,
  organizationId,
  userMembership,
}) => {
  const { data: song, isLoading: isSongLoading } = trpc.song.get.useQuery({
    songId,
    organizationId,
  });

  const { data: playHistory, isLoading: isPlayHistoryLoading } =
    trpc.song.getPlayHistory.useQuery({
      songId,
      organizationId,
    });

  const isLoading = isSongLoading || isPlayHistoryLoading;

  if (isLoading) {
    return <SongDetailsPageLoading />;
  }

  if (!song) {
    return notFound();
  }

  const dateFormatter = new Intl.DateTimeFormat("en-US");

  const lastPlayInstance =
    playHistory && playHistory.length > 0 ? playHistory[0] : undefined;

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
              {playHistory && lastPlayInstance ? (
                <HStack className="gap-[3px] leading-4">
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
              ) : (
                <Text style="body-small" className="text-slate-700">
                  Hasn&apos;t been played in a set yet
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
      <SongResources songId={songId} />
      <Card title="Play history" collapsible>
        <div className="grid grid-cols-[16px_1fr] gap-y-4">
          {playHistory &&
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
