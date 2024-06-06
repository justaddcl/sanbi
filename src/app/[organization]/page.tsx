import {
  SetListCard,
  SetListCardBody,
  SetListCardHeader,
  SetListCardSection,
  SongItem,
} from "@/modules/SetlistCard";
import Link from "next/link";

export default async function Dashboard({
  params,
}: {
  params: { organization: string };
}) {
  return (
    <div className="flex min-w-full max-w-xs flex-col justify-center">
      <header className="pb-2">
        <h1 className="mb-1 text-2xl font-bold">Upcoming sets</h1>
        <h2 className="text-xs text-slate-500">3 sets</h2>
      </header>
      <section className="flex justify-between py-2">
        <select>
          <option value="This week">This week</option>
        </select>
        <a className="text-xs text-slate-900">See all</a>
      </section>
      <div className="flex flex-col gap-4">
        <Link href={`/${params.organization}/sets/demo`}>
          <SetListCard>
            <SetListCardHeader
              date="2024-08-14"
              type="Sunday Service"
              numberOfSongs={5}
            />
            <SetListCardBody>
              <SetListCardSection title="Worship">
                <SongItem index={1} songKey="B" name="In My Place" />
                <SongItem index={2} songKey="A" name="Such An Awesome God" />
                <SongItem
                  index={3}
                  songKey="G"
                  name="I Love You Lord / What A Beautiful Name (mash up)"
                />
                <SongItem index={4} songKey="A" name="God Over Everything" />
              </SetListCardSection>
              <SetListCardSection title="Prayer Time">
                <SongItem index={5} songKey="B" name="Son Of Suffering" />
              </SetListCardSection>
            </SetListCardBody>
          </SetListCard>
        </Link>
        <SetListCard>
          <SetListCardHeader
            date="2024-08-07"
            type="Team Stoneway"
            numberOfSongs={8}
          />
          <SetListCardBody>
            <SetListCardSection title="Worship">
              <SongItem index={1} songKey="B" name="In My Place" />
              <SongItem index={2} songKey="A" name="Such An Awesome God" />
              <SongItem
                index={3}
                songKey="G"
                name="I Love You Lord / What A Beautiful Name (mash up)"
              />
              <SongItem index={4} songKey="A" name="God Over Everything" />
            </SetListCardSection>
            <SetListCardSection title="Lord's Supper">
              <SongItem index={5} songKey="B" name="Son Of Suffering" />
            </SetListCardSection>
            <SetListCardSection title="Prayer Time">
              <SongItem index={6} songKey="B" name="Son Of Suffering" />
              <SongItem index={7} songKey="A" name="Romans 2:4" />
              <SongItem index={8} songKey="G" name="Only Jesus" />
            </SetListCardSection>
          </SetListCardBody>
        </SetListCard>
        <SetListCard>
          <SetListCardHeader
            date="2024-08-07"
            type="Sunday Service"
            numberOfSongs={5}
          />
          <SetListCardBody>
            <SetListCardSection title="Worship">
              <SongItem index={1} songKey="B" name="In My Place" />
              <SongItem index={2} songKey="A" name="Such An Awesome God" />
              <SongItem
                index={3}
                songKey="G"
                name="I Love You Lord / What A Beautiful Name (mash up)"
              />
              <SongItem index={4} songKey="A" name="God Over Everything" />
            </SetListCardSection>
            <SetListCardSection title="Prayer Time">
              <SongItem index={5} songKey="B" name="Son Of Suffering" />
            </SetListCardSection>
          </SetListCardBody>
        </SetListCard>
      </div>
    </div>
  );
}
