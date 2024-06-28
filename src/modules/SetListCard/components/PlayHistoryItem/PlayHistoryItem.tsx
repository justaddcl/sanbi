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
  eventType: EventType["event"];

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
      <div className={`play-history-item relative flex flex-col gap-1`}>
        <div>
          <Text asElement="span" style="small-semibold">
            {formattedDate}
          </Text>
          {/* FIXME: come up with better solution to hard-coding the space around "for" */}
          <Text asElement="span" style="small">
            {" "}
            for{" "}
          </Text>
          <Text asElement="span" style="small-semibold">
            {eventType}
          </Text>
        </div>
        <div className="flex gap-1">
          <Text asElement="span" style="small" color="slate-500">
            Played in
          </Text>
          <SongKey songKey={songKey} {...accidentalsProps} />
          <Text asElement="span" style="small" color="slate-500">
            during{" "}
          </Text>
          <Text asElement="span" style="small" className="lowercase">
            {setSection}
          </Text>
        </div>
      </div>
    </>
  );
};
