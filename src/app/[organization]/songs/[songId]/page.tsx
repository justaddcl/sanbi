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
import { toast } from "sonner";
import { ArchivedBanner } from "@modules/shared/components";
import { useUserQuery } from "@modules/users/api/queries";
import { validate as uuidValidate } from "uuid";

export default async function SetListPage({
  params,
}: {
  params: { songId: string };
}) {
  const dateFormatter = new Intl.DateTimeFormat("en-US");

  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  const userData = await api.user.getUser({ userId });
  const userMembership = userData?.memberships[0];

  const song = await api.song.get({
    organizationId: userMembership!.organizationId,
    songId: params.songId,
  });

  const playHistory = await api.song.getPlayHistory({
    organizationId: userMembership!.organizationId,
    songId: params.songId,
  });

  if (!userData) {
    return <Text>Loading user data...</Text>;
  }

  if (!song) {
    return <Text>Loading...</Text>;
  }

  const lastPlayInstance =
    playHistory && playHistory.length > 0 ? playHistory[0] : undefined;

  // const unarchiveSong = () => {
  //   unarchiveSongMutation.mutate(
  //     { organizationId: userMembership!.organizationId, songId: params.songId },
  //     {
  //       onSuccess() {
  //         toast.success("Song has been unarchived");
  //         // TODO: invalidate song query
  //         // router.refresh();
  //       },
  //       onError(error) {
  //         toast.error(`Song could not be unarchived: ${error.message}`);
  //       },
  //     },
  //   );
  // };

  return (
    <PageContentContainer>
      <PageTitle title={song?.name ?? "Loading song..."} />
      {/* {song?.isArchived && (
        <ArchivedBanner
          itemType="song"
          onCtaClick={() => {
            return;
          }}
        />
      )} */}
      <Card title="Song details" collapsible>
        <VStack as="dl" className="gap-4 md:gap-6">
          <SongDetailsItem icon="MusicNoteSimple" label="Preferred Key">
            <dd>
              <SongKey songKey={song?.preferredKey ?? null} size="large" />
            </dd>
          </SongDetailsItem>
          <SongDetailsItem icon="ClockCounterClockwise" label="Last Played">
            <dd>
              {lastPlayInstance ? (
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
          {song?.tags && (
            <SongDetailsItem icon="Tag" label="Tags">
              <HStack as="dd" className="gap-2">
                {song?.tags.map((tag) => (
                  <Badge key={tag.tagId} label={tag.tag.tag} />
                ))}
              </HStack>
            </SongDetailsItem>
          )}
          {song?.notes && (
            <SongDetailsItem icon="NotePencil" label="Notes">
              <Text style="body-small">{unescapeHTML(song.notes)}</Text>
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
          organizationId={userMembership!.organizationId}
          archived={!!song?.isArchived}
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
                key={`${playInstance.set.id}-${playInstance.section.position}`}
                date={dateFormatter.format(new Date(playInstance.set.date))}
                eventType={playInstance.set.eventType}
                songKey={playInstance.song.key}
                setSection={playInstance.section.typeName}
                setId={playInstance.set.id}
              />
            ))}
          <PlayHistoryItem date={dateFormatter.format(song?.createdAt)} />
        </div>
      </Card>
    </PageContentContainer>
  );
}
