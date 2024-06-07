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

  /**
   * FIXME: this variable can be used when the `-left` value can be computed as expected
   * See not above `-left`
   */
  const bulletGridColumnWidth = "16px";
  const bulletWidth = "8px";
  const bulletOffsetTop = "4px";
  const bulletOffsetBottom = "4px";

  const bulletLineBaseStyles = [
    "absolute",
    "w-[1px]",
    "bg-slate-200",
    `content-['']`,
    /**
     * the line needs to line up with the middle of the bullet so
     * it needs to be shifted the width of the first column (16px) minus half
     * the width of the bullet (8px)
     * the current solution is hard-coded since using the calc function won't work
     */
    // `left-[calc(${bulletGridColumnWidth}-(calc((${bulletWidth}/2))))]`,
    "-left-[12px]",

    /**
     * the starting y position of the line must account for the top offset (which
     * should be half of the text line height of the corresponding row) and
     * height of the bullet (8px) as well as and margin below the bullet (4px)
     */
    `top-[calc(${bulletOffsetTop}+${bulletWidth}+${bulletOffsetBottom})]`,

    /**
     * the height of the line should be the height of the element + grid gap (16px)
     * minus the top offset so the line ends right when the next item below begins
     * however, 100% seems to work so keeping this for now
     */
    `h-[calc(100%)]`,
  ];

  const mappedStyles = bulletLineBaseStyles
    .map((style) => `[&:not(:last-child)]:before:${style}`)
    .join(" ");
  console.log("🚀 ~ ms:", mappedStyles);

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
      <div
        className={`relative flex flex-col gap-1 text-[10px] ${mappedStyles}`}
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
