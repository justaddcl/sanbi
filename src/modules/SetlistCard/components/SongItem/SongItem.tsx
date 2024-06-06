export type SongItemProps = {
  /** index of song in the set list */
  index: number;

  /** what key the song will be played in */
  songKey: string;

  /** name of song */
  name: string;
};

export const SongItem: React.FC<SongItemProps> = ({ index, songKey, name }) => {
  // something

  return (
    <div className="flex gap-3 text-xs font-semibold">
      <p className="h-[18px] w-[18px] flex-none text-right text-xs/[18px] text-slate-400">
        {index}.
      </p>
      <div className="items-top flex gap-2">
        <p className="flex h-4 w-4 flex-none place-content-center rounded bg-slate-200">
          {songKey}
        </p>
        <p className="text-slate-900">{name}</p>
      </div>
    </div>
  );
};
