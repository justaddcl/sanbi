import {
  SongKey,
  type SongKeyFlatProps,
  type SongKeyProps,
  type SongKeySharpProps,
} from "@components/SongKey";
import { Text } from "@components/Text";
import { formatDate } from "@lib/date";
import { type EventType, type None } from "@lib/types";
import { PlayHistoryBullet } from "../PlayHistoryBullet/PlayHistoryBullet";
import { isFuture } from "date-fns";
import Link from "next/link";

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
  eventType: EventType["name"];

  /** What key the song was played in? */
  songKey: SongKeyProps["songKey"];

  /** What section of the set was the song played in? */
  setSection: string;

  /** What is the set ID tied to the play history item? */
  setId: string;
};

/** PlayHistoryItemExtendedProps, but force everything to be undefined */
type NoExtendedProps = None<PlayHistoryItemExtendedProps>;

export const PlayHistoryItem: React.FC<PlayHistoryItemProps> = ({
  date,
  eventType,
  songKey,
  setSection,
  setId,
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
        <div className={`relative flex flex-col gap-1`}>
          <Text fontWeight="semibold" fontSize="[10px]">
            Song added to library
          </Text>
          <Text fontSize="[10px]" color="slate-500">
            {formattedDate}
          </Text>
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
      <Link
        href={`../sets/${setId}`}
        className={`play-history-item relative flex flex-col gap-1 ${isFuture(date) ? "italic" : "not-italic"}`}
      >
        <div className="flex gap-[3px] leading-[16px]">
          <Text
            style="small-semibold"
            // TODO: figure out a better way of changing the text color as this is repeated
            {...(isFuture(date) && { color: "slate-500" })}
          >
            {formattedDate}
          </Text>
          <Text style="small" {...(isFuture(date) && { color: "slate-500" })}>
            for
          </Text>
          <Text
            style="small-semibold"
            {...(isFuture(date) && { color: "slate-500" })}
          >
            {eventType}
          </Text>
        </div>
        <div className="flex gap-1">
          <Text asElement="span" style="small" color="slate-500">
            {isFuture(date) ? "Will play" : "Played"} in
          </Text>
          <SongKey songKey={songKey} {...accidentalsProps} />
          <Text asElement="span" style="small" color="slate-500">
            during{" "}
          </Text>
          <Text
            asElement="span"
            style="small"
            className="lowercase"
            {...(isFuture(date) && { color: "slate-500" })}
          >
            {setSection}
          </Text>
        </div>
      </Link>
    </>
  );
};
