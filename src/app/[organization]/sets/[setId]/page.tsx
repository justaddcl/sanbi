import { SetListCardBody, SongItem } from "@/modules/SetlistCard";

export default async function SetListPage({
  params,
}: {
  params: { setId: string };
}) {
  return (
    <div className="flex min-w-full max-w-xs flex-col justify-center gap-6">
      <header className="flex flex-col gap-1 pb-2">
        <h1 className="text-2xl font-bold">August 07</h1>
        <h2 className="text-base text-slate-700">Discipleship Community</h2>
        <p className="text-xs text-slate-500">8 songs</p>
      </header>
      <section className="flex justify-between gap-2">
        <button className="w-full rounded border border-slate-300 px-3 text-xs font-semibold text-slate-700">
          Add notes
        </button>
        <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
          ...
        </button>
      </section>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 rounded border border-slate-200 p-4 shadow">
          <header className="flex flex-col gap-2">
            <div className="flex justify-between">
              <h3 className="text-base font-semibold">Worship</h3>
              <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
                ...
              </button>
            </div>
            <hr className="bg-slate-100" />
          </header>
          <SetListCardBody>
            <div className="flex flex-col gap-3">
              <SongItem
                index={1}
                songKey="B"
                name="In My Place"
                notes="Play in the key of B to make it easier for the backup vocalist to harmonize with."
              />
              <SongItem index={2} songKey="A" name="Such An Awesome God" />
              <SongItem
                index={3}
                songKey="G"
                name="I Love You Lord / What A Beautiful Name (mash up)"
                notes="Song is best with only vocals, guitar, and keys. Feels powerful with only vocals on the last chorus."
              />
              <SongItem index={4} songKey="A" name="God Over Everything" />
            </div>
          </SetListCardBody>
        </div>
        <div className="flex flex-col gap-4 rounded border border-slate-200 p-4 shadow">
          <header className="flex flex-col gap-2">
            <div className="flex justify-between">
              <h3 className="text-base font-semibold">Lord's Supper</h3>
              <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
                ...
              </button>
            </div>
            <hr className="bg-slate-100" />
          </header>
          <SetListCardBody>
            <div className="flex flex-col gap-3">
              <SongItem index={5} songKey="B" name="Son Of Suffering" />
            </div>
          </SetListCardBody>
        </div>
        <div className="flex flex-col gap-4 rounded border border-slate-200 p-4 shadow">
          <header className="flex flex-col gap-2">
            <div className="flex justify-between">
              <h3 className="text-base font-semibold">Prayer</h3>
              <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
                ...
              </button>
            </div>
            <hr className="bg-slate-100" />
          </header>
          <SetListCardBody>
            <div className="flex flex-col gap-3">
              <SongItem index={6} songKey="B" name="Draw Me Close To You" />
              <SongItem index={7} songKey="A" name="Romans 2:4" />
              <SongItem
                index={8}
                songKey="G"
                name="Only Jesus"
                notes="Skip the tag if not playing with full band."
              />
            </div>
          </SetListCardBody>
        </div>
      </div>
    </div>
  );
}
