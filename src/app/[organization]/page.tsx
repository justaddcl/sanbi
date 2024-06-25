import { PageTitle } from "@/components";
import {
  CardList,
  SetListCard,
  SetListCardBody,
  SetListCardHeader,
  SetListCardSection,
  SongItem,
} from "@/modules/SetListCard";
import { db } from "@/server/db";
import { organizations, sets } from "@/server/db/schema";
import { eq, or } from "drizzle-orm";
import Link from "next/link";

export default async function Dashboard({
  params,
}: {
  params: { organization: string };
}) {
  // TODO: solve how to handle slugs vs. org IDs

  // FIXME: move query to db/queries
  const organizationSets = await db.query.sets.findMany({
    where: eq(sets.organizationId, params.organization),
    with: {
      sections: {
        with: {
          songs: {
            with: {
              song: true,
            },
          },
          type: true,
        },
      },
      eventType: true,
    },
  });

  return (
    <div className="flex min-w-full max-w-xs flex-col justify-center">
      <PageTitle title="Upcoming sets" details="3 sets" />
      <section className="flex justify-between py-2">
        <select>
          <option value="This week">This week</option>
        </select>
        <a className="text-xs text-slate-900">See all</a>
      </section>
      <CardList>
        {organizationSets.map((orgSet) => (
          <Link
            key={orgSet.id}
            href={`/${params.organization}/sets/${orgSet.id}`}
          >
            <SetListCard>
              <SetListCardHeader
                date={orgSet.date}
                type={orgSet.eventType.event}
                numberOfSongs={orgSet.sections.reduce(
                  (total, section) => total + section.songs.length,
                  0,
                )}
              />
              <SetListCardBody>
                {orgSet.sections.map((section) => (
                  <SetListCardSection
                    key={section.id}
                    title={section.type.section}
                  >
                    {section.songs.map((song) => {
                      console.log("🚀 ~ {section.songs.map ~ song:", song);
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
                          key={song.songId}
                          href={`/${params.organization}/songs/${song.songId}`}
                        >
                          <SongItem
                            index={indexStart + song.position}
                            songKey={song.song!.key}
                            name={song.song!.name}
                          />
                        </Link>
                      );
                    })}
                  </SetListCardSection>
                ))}
              </SetListCardBody>
            </SetListCard>
          </Link>
        ))}
      </CardList>
    </div>
  );
}
