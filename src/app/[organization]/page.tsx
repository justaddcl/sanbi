import { PageTitle } from "@/components";
import { pluralize } from "@/lib/string";
import { PageContentContainer } from "@components/PageContentContainer";
import { VStack } from "@components/VStack";
import {
  SetListCardHeader,
  SetListCardSection,
  SongItem,
} from "@modules/SetListCard";
import { db } from "@server/db";
import { sets } from "@server/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { validate as uuidValidate } from "uuid";

export default async function Dashboard({
  params,
}: {
  params: { organization: string };
}) {
  // TODO: solve how to handle slugs vs. org IDs

  const isOrgIdValidUuid = uuidValidate(params.organization);
  if (!isOrgIdValidUuid) {
    console.error(
      `🤖 - ${params.organization} is not a valid UUID - queries/getOrganization`,
    );
    notFound();
  }

  // FIXME: move query to api set router
  const organizationSets = await db.query.sets.findMany({
    where: eq(sets.organizationId, params.organization),
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
        <select>
          <option value="This week">This week</option>
        </select>
        <a className="text-xs text-slate-900">See all</a>
      </section>
      {/* FIXME: update set list styling */}
      <VStack className="gap-8">
        {organizationSets.map((orgSet) => (
          <Link
            key={orgSet.id}
            href={`/${params.organization}/sets/${orgSet.id}`}
          >
            <VStack className="h-full min-w-full max-w-xs flex-1 gap-6 rounded-lg border p-4 shadow lg:p-6">
              <SetListCardHeader
                date={orgSet.date}
                type={orgSet.eventType.name}
                numberOfSongs={orgSet.sections.reduce(
                  (total, section) => total + section.songs.length,
                  0,
                )}
              />
              <VStack className="gap-6">
                {orgSet.sections.map((section) => (
                  <SetListCardSection
                    key={section.id}
                    title={section.type.name}
                  >
                    {section.songs.map((setSectionSong) => {
                      let indexStart = 1;

                      for (
                        let sectionPosition = 0;
                        sectionPosition < section.position;
                        sectionPosition++
                      ) {
                        indexStart +=
                          orgSet.sections[sectionPosition]!.songs.length;
                      }
                      return (
                        <Link
                          key={setSectionSong.songId}
                          href={`/${params.organization}/songs/${setSectionSong.songId}`}
                        >
                          <SongItem
                            index={indexStart + setSectionSong.position}
                            setSectionSong={setSectionSong}
                            setSectionType={section.type.name}
                            setId={orgSet.id}
                          />
                        </Link>
                      );
                    })}
                  </SetListCardSection>
                ))}
              </VStack>
            </VStack>
          </Link>
        ))}
      </VStack>
    </PageContentContainer>
  );
}
