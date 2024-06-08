import {
  SongKey,
  type SongKeyFlatProps,
  type SongKeySharpProps,
  type SongKeyProps,
} from "@/components";
import { type SetListCardHeaderProps } from "../SetListCardHeader";
import { formatDate } from "@/lib/date";
import { type None } from "@/lib/types";
import { PlayHistoryBullet } from "../PlayHistoryBullet/PlayHistoryBullet";

/**
 * A PlayHistoryItem can include just the date or include extended properties
 * If the PlayHistoryItem has any of the extended properties, we will require
 * that all the non-optional properties are also present
 */
export type PlayHistoryItemProps = PlayHistoryItemBaseProps &
  (PlayHistoryItemExtendedProps | NoExtendedProps);

type PlayHistoryItemBaseProps = {
  /** When was the song played? */
  date: string;
};

type PlayHistoryItemExtendedProps = (SongKeyFlatProps | SongKeySharpProps) & {
  /** What type of event the song was played at? */
  eventType: SetListCardHeaderProps["type"];

  /** What key the song was played in? */
  songKey: SongKeyProps["songKey"];

  /** What section of the set was the song played in? */
  setSection: string;
};

/** PlayHistoryItemExtendedProps, but force everything to be undefined */
type NoExtendedProps = None<PlayHistoryItemExtendedProps>;

export const PlayHistoryItem: React.FC<PlayHistoryItemProps> = ({
  date,
  eventType,
  songKey,
  setSection,
  flat,
  sharp,
}) => {
  const formattedDate = formatDate(date, { format: "long" });

  /**
   * We have to define the accidentals (flat/sharp) props this way, otherwise TypeScript
   * will complain the type is invalid due to the mutually exclusive relationship of the
   * flat and sharp props
   */
  let accidentalsProps = {};
  if (flat) {
    accidentalsProps = {
      flat: true,
      sharp: undefined,
    };
  } else if (sharp) {
    accidentalsProps = {
      sharp: true,
      flat: undefined,
    };
  }

  if (!eventType || !songKey || !setSection) {
    return (
      <>
        <PlayHistoryBullet />
        <div
          className={`relative flex flex-col gap-1 text-[10px] font-semibold`}
        >
          <p>Song added to library</p>
          <p className="font-normal text-slate-500">{formattedDate}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PlayHistoryBullet />
      {/**
       * NOTE: the styles for the play history item's `::before` pseudo element is in `styles/globals.css`
       * as Tailwind wouldn't properly apply the styles
       */}
      <div
        className={`play-history-item relative flex flex-col gap-1 text-[10px]`}
      >
        <p>
          <span className="font-semibold">{formattedDate}</span>
          <span> for </span>
          <span className="font-semibold">{eventType}</span>
        </p>
        <p className="flex gap-1 text-slate-500">
          <span className="">Played in</span>
          <SongKey songKey={songKey} {...accidentalsProps} />
          <span className="">during </span>
          <span className="lowercase text-slate-700">{setSection}</span>
        </p>
      </div>
    </>
  );
};
