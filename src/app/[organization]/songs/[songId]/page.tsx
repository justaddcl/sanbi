import { SongActionsMenu } from "@/modules/songs/components/SongActionsMenu";
import { db } from "@/server/db";
import {
  eventTypes,
  setSectionSongs,
  setSectionTypes,
  setSections,
  sets,
  songs,
} from "@/server/db/schema";
import { api } from "@/trpc/server";
import { auth } from "@clerk/nextjs/server";
import { Badge } from "@components/Badge";
import { Card } from "@components/Card/Card";
import { HStack } from "@components/HStack";
import { PageContentContainer } from "@components/PageContentContainer";
import { PageTitle } from "@components/PageTitle";
import { SongKey } from "@components/SongKey";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { PlayHistoryItem, ResourceCard } from "@modules/SetListCard";
import {
  Archive,
  ClockCounterClockwise,
  DotsThree,
  Heart,
  ListPlus,
  Metronome,
  MusicNotesSimple,
  Plus,
  Tag,
  TagSimple,
} from "@phosphor-icons/react/dist/ssr";
import { formatDistanceToNow, isPast } from "date-fns";
import { asc, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import unescapeHTML from "validator/es/lib/unescape";
import { SongDetailsLabel } from "@modules/songs/components";
import { SongDetailsItem } from "@modules/songs/components/SongDetailsItem/SongDetailsItem";

export default async function SetListPage({
  params,
}: {
  params: { songId: string };
}) {
  // FIXME: move query to db/queries
  const songData = await db.query.songs.findFirst({
    where: eq(songs.id, params.songId),
    with: {
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  /**
   * We have to use the sql-like API since we can't properly use the `orderBy`
   * sorting when using `findMany`
   */
  const playHistory = await db
    .select()
    .from(setSectionSongs)
    .leftJoin(setSections, eq(setSectionSongs.setSectionId, setSections.id))
    .leftJoin(
      setSectionTypes,
      eq(setSections.sectionTypeId, setSectionTypes.id),
    )
    .leftJoin(sets, eq(sets.id, setSections.setId))
    .leftJoin(eventTypes, eq(eventTypes.id, sets.eventTypeId))
    .orderBy(desc(sets.date), asc(setSections.position))
    .where(eq(setSectionSongs.songId, params.songId));
  const dateFormatter = new Intl.DateTimeFormat("en-US");

  const lastPlayed =
    playHistory.length > 0
      ? playHistory.find((playInstance) => isPast(playInstance.sets!.date))
      : null;

  const { userId } = auth();

  if (!userId || !songData) {
    redirect(`/`);
  }

  const userData = await api.user.getUser({ userId });
  const userMembership = userData?.memberships[0];

  if (!userMembership) {
    redirect(`/`);
  }

  return (
    <PageContentContainer>
      <PageTitle title={songData.name} />
      {songData.isArchived && (
        // <ArchivedBanner itemType="set" onCtaClick={unarchiveSet} />
        <HStack className="items-center gap-1  text-slate-500">
          <Archive />
          <Text>Song is archived</Text>
        </HStack>
      )}
      <Card title="Song details" collapsible>
        <VStack as="dl" className="gap-4 md:gap-6">
          <SongDetailsItem icon="MusicNoteSimple" label="Preferred Key">
            <dd>
              <SongKey songKey={songData.preferredKey} size="large" />
            </dd>
          </SongDetailsItem>
          <SongDetailsItem icon="ClockCounterClockwise" label="Last Played">
            <dd>
              {lastPlayed ? (
                <HStack className="gap-[3px] leading-4">
                  <Text
                    asElement="span"
                    style="body-small"
                    className="text-slate-700"
                  >
                    {formatDistanceToNow(lastPlayed.sets!.date, {
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
                    {lastPlayed.event_types?.name}
                  </Text>
                </HStack>
              ) : (
                <Text style="body-small" className="text-slate-700">
                  Hasn&apos;t been played in a set yet
                </Text>
              )}
            </dd>
          </SongDetailsItem>
          {songData?.tags && (
            <SongDetailsItem icon="Tag" label="Tags">
              <HStack as="dd" className="gap-2">
                {songData?.tags.map((tag) => (
                  <Badge key={tag.tagId} label={tag.tag.tag} />
                ))}
              </HStack>
            </SongDetailsItem>
          )}
          {songData?.notes && (
            <SongDetailsItem icon="NotePencil" label="Notes">
              <Text style="body-small">{unescapeHTML(songData.notes)}</Text>
            </SongDetailsItem>
          )}
        </VStack>
      </Card>
      <HStack as="section" className="justify-between gap-2">
        <button className="flex w-full items-center justify-center gap-2 rounded border border-slate-300 px-3 text-slate-700">
          <ListPlus size={12} />
          <Text
            asElement="span"
            style="header-small-semibold"
            className="text-slate-700"
          >
            Add to set
          </Text>
        </button>
        <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
          <Heart className="text-slate-900" size={12} />
        </button>
        <SongActionsMenu
          songId={params.songId}
          organizationId={userMembership.organizationId}
          archived={songData.isArchived ?? false}
        />
      </HStack>
      <Card
        title="Resources"
        collapsible
        // buttonLabel={
        //   <>
        //     <Plus />
        //     Add resource
        //   </>
        // }
        // buttonOnClick={async () => {
        //   "use server";
        //   console.log("🤖 - song details page - buttonOnClick");
        // }}
      >
          <div className="grid grid-cols-[repeat(auto-fill,_124px)] grid-rows-[repeat(auto-fill,_92px)] gap-2">
            <ResourceCard title="In My Place" url="theworshipinitiative.com" />
            <ResourceCard title="In My Place" url="open.spotify.com" />
          </div>
      </Card>
      <Card title="Play history" collapsible>
          <div className="grid grid-cols-[16px_1fr] gap-y-4">
            {playHistory.length > 0 &&
              playHistory.map((playInstance) => (
                <PlayHistoryItem
                  key={`${playInstance.sets?.id}-${playInstance.set_sections?.position}`}
                  date={dateFormatter.format(new Date(playInstance.sets!.date))}
                  eventType={playInstance.event_types!.name}
                  songKey={playInstance.set_section_songs.key}
                  setSection={playInstance.set_section_types!.name}
                  setId={playInstance.sets!.id}
                />
              ))}
            <PlayHistoryItem date={dateFormatter.format(songData?.createdAt)} />
          </div>
      </Card>
    </PageContentContainer>
  );
}
