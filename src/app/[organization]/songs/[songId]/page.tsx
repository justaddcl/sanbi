import { Badge, PageTitle, SongKey } from "@/components";
import { CardList, PlayHistoryItem, ResourceCard } from "@/modules/SetListCard";
import {
  DotsThree,
  Heart,
  ListPlus,
  MusicNotesSimple,
  ClockCounterClockwise,
  TagSimple,
  Metronome,
} from "@phosphor-icons/react/dist/ssr";

export default async function SetListPage({
  params: _params,
}: {
  params: { setId: string };
}) {
  return (
    <div className="flex min-w-full max-w-xs flex-col justify-center gap-6">
      <PageTitle title="In My Place" />
      <section>
        {/* FIXME: refactor definition list into re-usable component */}
        <dl className="text-xs text-slate-700">
          <dt className="mb-[2px] flex items-center gap-1 text-[8px]/[12px] uppercase text-slate-500">
            <MusicNotesSimple className="text-slate-400" size={8} />
            <span>Preferred Key</span>
          </dt>
          <dd className="[&:not(:last-child)]:mb-2">
            <SongKey songKey="B" size="medium" />
          </dd>
          <dt className="mt-2 flex items-center gap-1 text-[8px]/[12px] uppercase text-slate-500">
            <ClockCounterClockwise className="text-slate-400" size={8} />
            <span>Last Played</span>
          </dt>
          <dd className="[&:not(:last-child)]:mb-2">
            <span className="">One week ago</span>
            <span className="text-slate-500"> for </span>
            <span className="">Sunday service</span>
          </dd>
          <dt className="flex items-center gap-1 text-[8px]/[12px] uppercase text-slate-500">
            <TagSimple className="text-slate-400" size={8} />
            <span>Tags</span>
          </dt>
          <dd className="flex gap-2 [&:not(:last-child)]:mb-2">
            <Badge label="The cross" />
            <Badge label="Easter" />
          </dd>
          <dt className="flex items-center gap-1 text-[8px]/[12px] uppercase text-slate-500">
            <Metronome className="text-slate-400" size={8} />
            <span>Tempo</span>
          </dt>
          <dd className="[&:not(:last-child)]:mb-2">Slow</dd>
        </dl>
      </section>
      <section className="flex flex-col gap-4 text-xs">
        <h3 className="font-semibold text-slate-500">Notes</h3>
        <p className="text-slate-900">
          Play in the key of B to make it easier for the backup vocalist to
          harmonize with.
        </p>
      </section>
      <section className="flex justify-between gap-2">
        <button className="flex w-full items-center justify-center gap-2 rounded border border-slate-300 px-3 text-xs font-semibold text-slate-700">
          <ListPlus size={12} />
          Add to set
        </button>
        <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
          <Heart className="text-slate-900" size={12} />
        </button>
        <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
          <DotsThree className="text-slate-900" size={12} />
        </button>
      </section>
      <CardList gap="gap-8">
        <div className="flex flex-col gap-4 rounded border border-slate-200 p-4 shadow">
          <header className="flex flex-col gap-2">
            <div className="flex justify-between">
              <h3 className="text-base font-semibold">Resources</h3>
              <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
                <DotsThree className="text-slate-900" size={12} />
              </button>
            </div>
            <hr className="bg-slate-100" />
          </header>
          <div className="flex flex-wrap gap-2">
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
            <PlayHistoryItem
              date="2022-08-14"
              eventType="Sunday Service"
              songKey="G"
              setSection="Worship"
            />
            <PlayHistoryItem
              date="2022-08-07"
              eventType="Team Stoneway"
              songKey="B"
              setSection="Lord's Supper"
            />
            <PlayHistoryItem
              date="2024-08-07"
              eventType="Sunday Service"
              songKey="B"
              setSection="Prayer"
            />
            <PlayHistoryItem date="2022-07-31" />
          </div>
        </div>
      </CardList>
    </div>
  );
}
