import { SongKey, type SongKeyProps } from "@/components";

export type SongItemProps = {
  /** index of song in the set list */
  index: number;

  /** what key the song will be played in */
  songKey: SongKeyProps["songKey"];

  /** name of song */
  name: string;

  /** song notes */
  notes?: string;
};

export const SongItem: React.FC<SongItemProps> = ({
  index,
  songKey,
  name,
  notes,
}) => {
  return (
    <div className="flex gap-3 text-xs font-semibold">
      <p className="h-[18px] w-[18px] flex-none text-right text-xs/[18px] text-slate-400">
        {index}.
      </p>
      <div className="flex flex-col gap-2">
        <div className="items-top flex gap-2">
          <SongKey songKey={songKey} />
          <p className="text-slate-900">{name}</p>
        </div>
        {notes ? (
          <p className="text-[10px]/[16px] font-normal text-slate-700">
            {notes}
          </p>
        ) : null}
      </div>
    </div>
  );
};
