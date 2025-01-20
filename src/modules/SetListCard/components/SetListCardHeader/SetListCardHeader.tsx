import { pluralize } from "@/lib/string";
import { type EventType } from "@/lib/types";
import { Text } from "@components/Text";
import { formatDate } from "@lib/date/";

export type SetListCardHeaderProps = {
  /** date of set */
  date: string;

  /** type of event the set will be played at */
  type: EventType["name"];

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
        {/* FIXME: should this use an existing text style or a new style be defined? */}
        <Text asElement="span" fontSize="[8px]" className="uppercase">
          {month}
        </Text>
        {/* FIXME: should this use an existing text style or a new style be defined? */}
        <Text
          asElement="span"
          fontWeight="medium"
          fontSize="base"
          lineHeight="4"
        >
          {day}
        </Text>
      </div>
      <div>
        {/* FIXME: should this use an existing text style or a new style be defined? */}
        <Text asElement="h2" fontWeight="bold" fontSize="base/5">
          {type}
        </Text>
        <Text style="small" color="slate-500">
          {numberOfSongs}{" "}
          {pluralize(numberOfSongs, { singular: "song", plural: "songs" })}
        </Text>
      </div>
    </header>
  );
};
