import { api } from "@/trpc/server";
import { auth } from "@clerk/nextjs/server";
import { Badge } from "@components/Badge";
import { Card } from "@components/Card/Card";
import { HStack } from "@components/HStack";
import { SongKey } from "@components/SongKey";
import { Text } from "@components/Text";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { VStack } from "@components/VStack";
import { PlayHistoryItem, ResourceCard } from "@modules/SetListCard";
import { ArchivedBanner } from "@modules/shared/components";
import {
  SongDetailsPageHeader,
  SongDetailsPageLoading,
} from "@modules/songs/components";
import { SongDetailsItem } from "@modules/songs/components/SongDetailsItem/SongDetailsItem";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { formatDistanceToNow } from "date-fns";
import { redirect } from "next/navigation";
import unescapeHTML from "validator/es/lib/unescape";

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

  if (!userMembership) {
    redirect("/");
  }

  const song = await api.song.get({
    organizationId: userMembership.organizationId,
    songId: params.songId,
  });

  const playHistory = await api.song.getPlayHistory({
    organizationId: userMembership.organizationId,
    songId: params.songId,
  });

  if (!userData) {
    return <Text>Loading user data...</Text>;
  }

  const lastPlayInstance =
    playHistory && playHistory.length > 0 ? playHistory[0] : undefined;

  if (!song) {
    return <SongDetailsPageLoading />;
  }

  return (
    <>
      <SongDetailsPageHeader song={song} userMembership={userMembership} />
      {song?.isArchived && <ArchivedBanner itemType="song" songId={song.id} />}
      <Button className="md:hidden">
        <Plus /> Add to a set
      </Button>
      <Card title="Song details" collapsible>
        <VStack as="dl" className="gap-4 md:gap-6">
          <SongDetailsItem icon="MusicNoteSimple" label="Preferred Key">
            <dd>
              <SongKey songKey={song.preferredKey} size="large" />
            </dd>
          </SongDetailsItem>
          <SongDetailsItem icon="ClockCounterClockwise" label="Last Played">
            <dd>
              {!playHistory && <Skeleton className="h-4 w-[250px]" />}
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
            <HStack as="dd" className="gap-2">
              {!song && (
                <>
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                </>
              )}
              {song.tags?.map((tag) => (
                <Badge key={tag.tagId} label={tag.tag.tag} />
              ))}
            </HStack>
          </SongDetailsItem>
          {song.notes && (
            <SongDetailsItem icon="NotePencil" label="Notes">
              <Text style="body-small">{unescapeHTML(song.notes)}</Text>
            </SongDetailsItem>
          )}
        </VStack>
      </Card>
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
          <PlayHistoryItem date={dateFormatter.format(song.createdAt)} />
        </div>
      </Card>
    </>
  );
}
