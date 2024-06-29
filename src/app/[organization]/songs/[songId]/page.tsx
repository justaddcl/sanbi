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
import { CardList, PlayHistoryItem, ResourceCard } from "@modules/SetListCard";
import {
  ClockCounterClockwise,
  DotsThree,
  Heart,
  ListPlus,
  Metronome,
  MusicNotesSimple,
  TagSimple,
} from "@phosphor-icons/react/dist/ssr";
import { asc, desc, eq } from "drizzle-orm";
import { formatRelative } from "date-fns";

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

  const lastPlayed = playHistory.length > 0 ? playHistory[0] : null;

  if (!songData) {
    // FIXME: need better error handling
    return null;
  }

  return (
    <div className="flex min-w-full max-w-xs flex-col justify-center gap-6">
      <PageTitle title={songData.name} />
      <section>
        {/* FIXME: refactor definition list into reusable components */}
        <dl>
          <dt className="mb-[2px] flex items-center gap-1 text-[8px]/[12px] uppercase text-slate-500">
            <MusicNotesSimple className="text-slate-400" size={8} />
            <span>Preferred Key</span>
          </dt>
          <dd className="[&:not(:last-child)]:mb-2">
            <SongKey songKey={songData.preferredKey} size="medium" />
          </dd>
          <dt className="mt-2 flex items-center gap-1 text-[8px]/[12px] uppercase text-slate-500">
            <ClockCounterClockwise className="text-slate-400" size={8} />
            <span>Last Played</span>
          </dt>
          <dd className="[&:not(:last-child)]:mb-2">
            {lastPlayed ? (
              <div className="flex gap-[3px] leading-4">
                <Text asElement="span" style="body-small" color="slate-700">
                  {/* TODO: write a customer formatter  */}
                  {formatRelative(lastPlayed.sets!.date, new Date())}
                </Text>
                <Text asElement="span" style="body-small" color="slate-500">
                  for
                </Text>
                <Text asElement="span" style="body-small" color="slate-700">
                  {lastPlayed.event_types?.event}
                </Text>
              </div>
            ) : (
              <Text color="slate-700" style="body-small">
                Hasn&apos;t been played in a set yet
              </Text>
            )}
          </dd>
          {songData?.tags && (
            <>
              <dt className="flex items-center gap-1 text-[8px]/[12px] uppercase text-slate-500">
                <TagSimple className="text-slate-400" size={8} />
                <span>Tags</span>
              </dt>
              <dd className="flex gap-2 [&:not(:last-child)]:mb-2">
                {songData?.tags.map((tag) => (
                  <Badge key={tag.tagId} label={tag.tag!.tag} />
                ))}
              </dd>
            </>
          )}
          {songData?.tempo && (
            <>
              <dt className="flex items-center gap-1 text-[8px]/[12px] uppercase text-slate-500">
                <Metronome className="text-slate-400" size={8} />
                <span>Tempo</span>
              </dt>
              <dd className="[&:not(:last-child)]:mb-2">
                <Text asElement="span" style="body-small" color="slate-700">
                  {songData.tempo}
                </Text>
              </dd>
            </>
          )}
        </dl>
      </section>
      {songData?.notes && (
        <section className="flex flex-col gap-4 text-xs">
          <Text asElement="h3" style="header-small-semibold">
            Notes
          </Text>
          <Text style="body-small">{songData.notes}</Text>
        </section>
      )}
      <section className="flex justify-between gap-2">
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
        <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
          <DotsThree className="text-slate-900" size={12} />
        </button>
      </section>
      <CardList gap="gap-8">
        {/* FIXME: refactor this markup to be reusable components */}
        <div className="flex flex-col gap-4 rounded border border-slate-200 p-4 shadow">
          <header className="flex flex-col gap-2">
            <div className="flex justify-between">
              <Text asElement="h3" style="header-medium-semibold">
                Resources
              </Text>
              <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
                <DotsThree className="text-slate-900" size={12} />
              </button>
            </div>
            <hr className="bg-slate-100" />
          </header>
          {/* TODO: add resources db set up and data */}
          <div className="grid grid-cols-[repeat(auto-fill,_124px)] grid-rows-[repeat(auto-fill,_92px)] gap-2">
            <ResourceCard title="In My Place" url="theworshipinitiative.com" />
            <ResourceCard title="In My Place" url="open.spotify.com" />
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded border border-slate-200 p-4 shadow">
          <header className="flex flex-col gap-2">
            <div className="flex justify-between">
              <h3 className="text-base font-semibold">Play history</h3>
              <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
                <DotsThree className="text-slate-900" size={12} />
              </button>
            </div>
            <hr className="bg-slate-100" />
          </header>
          <div className="grid grid-cols-[16px_1fr] gap-y-4">
            {playHistory.length > 0 &&
              playHistory.map((playInstance) => (
                <PlayHistoryItem
                  key={`${playInstance.sets?.id}-${playInstance.set_sections?.position}`}
                  date={dateFormatter.format(new Date(playInstance.sets!.date))}
                  eventType={playInstance.event_types!.event}
                  songKey={playInstance.set_section_songs.key}
                  setSection={playInstance.set_section_types!.section}
                />
              ))}
            <PlayHistoryItem date={dateFormatter.format(songData?.createdAt)} />
          </div>
        </div>
      </CardList>
    </div>
  );
}
