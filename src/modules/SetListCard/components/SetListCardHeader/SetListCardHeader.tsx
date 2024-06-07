export type SetListCardHeaderProps = {
  /** date of set */
  date: string;

  /** type of event the set will be played at */
  type: "Sunday Service" | "Team Stoneway";

  /** total number of songs in the set */
  numberOfSongs: number;
};

export const SetListCardHeader: React.FC<
  React.PropsWithChildren<SetListCardHeaderProps>
> = ({ date, type, numberOfSongs }) => {
  // TODO: move this to a util
  const formatOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "2-digit",
  };

  const formattedDate = new Intl.DateTimeFormat("en-US", formatOptions).format(
    new Date(date),
  );

  const [month, day] = formattedDate.split(" ");

  return (
    <header className="mb-4 flex items-center gap-2">
      <div className="flex flex-col items-center gap-[2px] rounded bg-slate-100 p-2">
        <span className="text-[8px]/[8px] uppercase">{month}</span>
        <span className="text-base/4 font-medium">{day}</span>
      </div>
      <div>
        <h2 className="text-base/5 font-bold">{type}</h2>
        <p className="text-[10px] text-slate-500">{numberOfSongs} songs</p>
      </div>
    </header>
  );
};
