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
import { organizations } from "@/server/db/schema";
import { eq, or } from "drizzle-orm";
import Link from "next/link";

export default async function Dashboard({
  params,
}: {
  params: { organization: string };
}) {
  const organization = await db
    .select()
    .from(organizations)
    .where(
      or(
        // eq(organizations.id, params.organization),
        eq(organizations.slug, params.organization),
      ),
    );
  console.log("🚀 ~ organization:", organization);

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
        <Link href={`/${params.organization}/sets/demo`}>
          <SetListCard>
            <SetListCardHeader
              date="2024-08-14"
              type="Sunday Service"
              numberOfSongs={5}
            />
            <SetListCardBody>
              <SetListCardSection title="Worship">
                <Link href={`/${params.organization}/songs/demo`}>
                  <SongItem index={1} songKey="B" name="In My Place" />
                </Link>
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
              <Link href={`/${params.organization}/songs/demo`}>
                <SongItem index={1} songKey="B" name="In My Place" />
              </Link>
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
              <Link href={`/${params.organization}/songs/demo`}>
                <SongItem index={1} songKey="B" name="In My Place" />
              </Link>
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
      </CardList>
    </div>
  );
}
