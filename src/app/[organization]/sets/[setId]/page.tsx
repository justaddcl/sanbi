import { pluralize } from "@/lib/string";
import { CardList, SetListCardBody, SongItem } from "@/modules/SetListCard";
import { db } from "@/server/db";
import { sets } from "@/server/db/schema";
import { PageTitle } from "@components/PageTitle";
import { Text } from "@components/Text";
import { DotsThree } from "@phosphor-icons/react/dist/ssr";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function SetListPage({
  params: params,
}: {
  params: { setId: string };
}) {
  // FIXME: move query to db/queries
  const setData = await db.query.sets.findFirst({
    where: eq(sets.id, params.setId),
    with: {
      eventType: true,
      sections: {
        with: {
          type: true,
          songs: {
            with: {
              song: true,
            },
          },
        },
      },
    },
  });
  console.log("🚀 ~ setData:", setData);
  const songCount =
    setData?.sections.reduce(
      (total, section) => total + section.songs.length,
      0,
    ) ?? 0;
  return (
    <div className="flex min-w-full max-w-xs flex-col justify-center gap-6">
      <PageTitle
        title={setData!.date}
        subtitle={setData!.eventType.event}
        details={`${songCount} ${pluralize(songCount, { singular: "song", plural: "songs" })}`}
      />
      <section className="flex justify-between gap-2">
        <button className="w-full rounded border border-slate-300 px-3 text-xs font-semibold text-slate-700">
          Add notes
        </button>
        <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
          <DotsThree className="text-slate-900" size={12} />
        </button>
      </section>
      {setData?.sections && setData.sections.length > 0 && (
        <CardList gap="gap-6">
          {setData.sections.map((section) => (
            // FIXME: refactor into reusable component
            <div
              key={section.id}
              className="flex flex-col gap-4 rounded border border-slate-200 p-4 shadow"
            >
              <header className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <Text asElement="h3" style="header-medium-semibold">
                    {section.type.section}
                  </Text>
                  <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
                    <DotsThree className="text-slate-900" size={12} />
                  </button>
                </div>
                <hr className="bg-slate-100" />
              </header>
              <SetListCardBody>
                {section.songs && section.songs.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {section.songs.map((setSectionSong) => {
                      let indexStart = 1;

                      for (
                        let sectionPosition = 0;
                        sectionPosition < section.position;
                        sectionPosition++
                      ) {
                        indexStart +=
                          setData.sections[sectionPosition]!.songs.length;
                      }

                      return (
                        <Link
                          key={setSectionSong.songId}
                          href={`../songs/${setSectionSong.songId}`}
                        >
                          <SongItem
                            index={indexStart + setSectionSong.position}
                            songKey={setSectionSong.key}
                            name={setSectionSong.song.name}
                            {...(setSectionSong.notes && {
                              notes: setSectionSong.notes,
                            })}
                          />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </SetListCardBody>
            </div>
          ))}
        </CardList>
      )}
    </div>
  );
}
