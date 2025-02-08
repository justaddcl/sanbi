import { db } from "@/server/db";
import {
  eventTypes,
  setSectionSongs,
  setSectionTypes,
  setSections,
  sets,
  songs,
} from "@/server/db/schema";
import { Badge } from "@components/Badge";
import { PageTitle } from "@components/PageTitle";
import { SongKey } from "@components/SongKey";
import { Text } from "@components/Text";
import { PlayHistoryItem, ResourceCard } from "@modules/SetListCard";
import {
  Archive,
  ClockCounterClockwise,
  DotsThree,
  Heart,
  ListPlus,
  Metronome,
  MusicNotesSimple,
  TagSimple,
} from "@phosphor-icons/react/dist/ssr";
import { asc, desc, eq } from "drizzle-orm";
import { formatDistanceToNow, isPast } from "date-fns";
import { SongActionsMenu } from "@/modules/songs/components/SongActionsMenu";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { VStack } from "@components/VStack";
import { HStack } from "@components/HStack";
import { PageContentContainer } from "@components/PageContentContainer";

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
      <section>
        {/* FIXME: refactor definition list into reusable components */}
        <VStack as="dl" className="gap-4 md:gap-6">
          <VStack className="gap-2">
            <HStack
              as="dt"
              className="items-center gap-2 text-xs uppercase text-slate-500"
            >
              <MusicNotesSimple className="text-slate-400" size={12} />
              <Text className="text-sm">Preferred Key</Text>
            </HStack>
            <dd>
              <SongKey songKey={songData.preferredKey} size="medium" />
            </dd>
          </VStack>
          <VStack className="gap-2">
            <HStack
              as="dt"
              className="items-center gap-2 text-xs uppercase text-slate-500"
            >
              <ClockCounterClockwise className="text-slate-400" size={12} />
              <Text className="text-sm">Last Played</Text>
            </HStack>
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
          </VStack>
          {songData?.tags && (
            <VStack className="gap-2">
              <HStack
                as="dt"
                className="items-center gap-2 text-xs uppercase text-slate-500"
              >
                <TagSimple className="text-slate-400" size={12} />
                <Text className="text-sm">Tags</Text>
              </HStack>
              <HStack as="dd" className="gap-2">
                {songData?.tags.map((tag) => (
                  <Badge key={tag.tagId} label={tag.tag.tag} />
                ))}
              </HStack>
            </VStack>
          )}
          {songData?.tempo && (
            <>
              <HStack
                as="dt"
                className="items-center gap-2 text-xs uppercase text-slate-500"
              >
                <Metronome className="text-slate-400" size={12} />
                <Text className="text-sm">Tempo</Text>
              </HStack>
              <dd>
                <Text
                  asElement="span"
                  style="body-small"
                  className="text-slate-700"
                >
                  {songData.tempo}
                </Text>
              </dd>
            </>
          )}
        </VStack>
      </section>
      {songData.isArchived && (
        <HStack className="items-center gap-1 uppercase text-slate-500">
          <Archive />
          <Text>Song is archived</Text>
        </HStack>
      )}
      {songData?.notes && (
        <VStack as="section" className="gap-4 text-xs">
          <Text asElement="h3" style="header-small-semibold">
            Notes
          </Text>
          <Text style="body-small">{songData.notes}</Text>
        </VStack>
      )}
      <HStack as="section" className="justify-between gap-2">
        <button className="flex w-full items-center justify-center gap-2 rounded border border-slate-300 px-3 text-slate-700">
          <ListPlus size={12} />
          <Text
            asElement="span"
            style="header-small-semibold"
            color="slate-700"
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
      <VStack className="gap-8">
        {/* FIXME: refactor this markup to be reusable components */}
        <VStack className="gap-4 rounded border border-slate-200 p-4 shadow">
          <VStack as="header" className="flex flex-col gap-2">
            <HStack className="flex justify-between">
              <Text asElement="h3" style="header-medium-semibold">
                Resources
              </Text>
              <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
                <DotsThree className="text-slate-900" size={12} />
              </button>
            </HStack>
            <hr className="bg-slate-100" />
          </VStack>
          {/* TODO: add resources db set up and data */}
          <div className="grid grid-cols-[repeat(auto-fill,_124px)] grid-rows-[repeat(auto-fill,_92px)] gap-2">
            <ResourceCard title="In My Place" url="theworshipinitiative.com" />
            <ResourceCard title="In My Place" url="open.spotify.com" />
          </div>
        </VStack>
        <VStack className="gap-4 rounded border border-slate-200 p-4 shadow">
          <VStack as="header" className="gap-2">
            <HStack className="flex justify-between">
              <h3 className="text-base font-semibold">Play history</h3>
              <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
                <DotsThree className="text-slate-900" size={12} />
              </button>
            </HStack>
            <hr className="bg-slate-100" />
          </VStack>
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
        </VStack>
      </VStack>
    </PageContentContainer>
  );
}
