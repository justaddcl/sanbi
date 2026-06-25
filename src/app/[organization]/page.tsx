import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { validate as uuidValidate } from "uuid";

import { PageContentContainer } from "@components/PageContentContainer";
import { VStack } from "@components/VStack";
import {
  SetListCardHeader,
  SetListCardSection,
  SongItem,
} from "@modules/SetListCard";
import { getSetSongNumbering } from "@modules/sets/utils/getSetSongNumbering";
import { pluralize } from "@lib/string";
import { db } from "@server/db";
import { sets } from "@server/db/schema";
import { PageTitle } from "@/components";

export default async function Dashboard({
  params,
}: {
  params: Promise<{ organization: string }>;
}) {
  // TODO: solve how to handle slugs vs. org IDs

  const { organization } = await params;
  const isOrgIdValidUuid = uuidValidate(organization);
  if (!isOrgIdValidUuid) {
    console.error(
      `🤖 - ${organization} is not a valid UUID - queries/getOrganization`,
    );
    notFound();
  }

  // FIXME: move query to api set router
  const organizationSets = await db.query.sets.findMany({
    where: eq(sets.organizationId, organization),
    with: {
      sections: {
        orderBy: (sections, { asc }) => [asc(sections.position)],
        with: {
          songs: {
            orderBy: (songs, { asc }) => [asc(songs.position)],
            with: {
              song: true,
            },
          },
          type: true,
        },
      },
      eventType: true,
    },
    orderBy: (sets, { desc }) => [desc(sets.date)],
  });

  return (
    <PageContentContainer>
      <PageTitle
        title="Upcoming sets"
        details={`${organizationSets.length} ${pluralize(organizationSets.length, { singular: "set", plural: "sets" })}`}
      />
      <section className="flex justify-between py-2">
        <select aria-label="Filter sets by date range">
          <option value="This week">This week</option>
        </select>
        <a className="text-xs text-slate-900">See all</a>
      </section>
      {/* FIXME: update set list styling */}
      <VStack className="gap-8">
        {organizationSets.map((orgSet) => (
          <div key={orgSet.id} className="relative">
            <Link
              href={`/${organization}/sets/${orgSet.id}`}
              className="absolute inset-0 rounded-lg"
              aria-label={`Open ${orgSet.eventType.name} set`}
            />
            <VStack className="h-full max-w-xs min-w-full flex-1 gap-6 rounded-lg border p-4 shadow-sm lg:p-6">
              <SetListCardHeader
                date={orgSet.date}
                type={orgSet.eventType.name}
                numberOfSongs={orgSet.sections.reduce(
                  (total, section) => total + section.songs.length,
                  0,
                )}
              />
              <VStack className="gap-6">
                {getSetSongNumbering(orgSet.sections).map(
                  ({ section, songs }) => (
                    <SetListCardSection
                      key={section.id}
                      title={section.type.name}
                    >
                      {songs.map(({ song: setSectionSong, displayIndex }) => (
                        <Link
                          key={setSectionSong.songId}
                          href={`/${organization}/songs/${setSectionSong.songId}`}
                          className="relative z-10"
                        >
                          <SongItem
                            index={displayIndex}
                            setSectionSong={setSectionSong}
                            setSectionType={section.type.name}
                            setId={orgSet.id}
                          />
                        </Link>
                      ))}
                    </SetListCardSection>
                  ),
                )}
              </VStack>
            </VStack>
          </div>
        ))}
      </VStack>
    </PageContentContainer>
  );
}
