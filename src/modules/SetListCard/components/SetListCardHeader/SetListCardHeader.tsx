import { Text } from "@components/Text";
import { formatDate } from "@lib/date/";

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
  const formattedDate = formatDate(date);
  const [month, day] = formattedDate.split(" ");

  return (
    <header className="mb-4 flex items-center gap-2">
      <div className="flex flex-col items-center gap-[2px] rounded bg-slate-100 p-2">
        <Text asElement="span" fontSize="[8px]/[8px]" className="uppercase">
          {month}
        </Text>
        <Text asElement="span" fontWeight="medium" fontSize="base/4">
          {day}
        </Text>
      </div>
      <div>
        <Text asElement="h2" fontWeight="bold" fontSize="base/5">
          {type}
        </Text>
        <Text style="small" color="slate-500">
          {numberOfSongs} songs
        </Text>
      </div>
    </header>
  );
};
