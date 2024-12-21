import { type FC } from "react";
import { Text } from "@components/Text";
import {
  type SongTagType,
  type Song,
  type SetSectionSongsType,
  Tag,
  SetType,
} from "@lib/types";
import { SongKey } from "@components/SongKey";
import { ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr";
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  formatDistanceToNow,
  intervalToDuration,
  intlFormatDistance,
} from "date-fns";
import { Badge } from "@components/Badge";

type SongListItemSongData = Pick<
  Song,
  "id" | "name" | "preferredKey" | "isArchived"
>;

type SongListItemProps = {
  song: SongListItemSongData;
  lastPlayed: Date | null;
  tags?: Tag["tag"][];
};

export const SongListItem: FC<SongListItemProps> = ({
  song,
  lastPlayed,
  tags,
}) => {
  const distanceFromLastPlayedInDays = differenceInCalendarDays(
    new Date(),
    lastPlayed ?? new Date(),
  );

  const distanceFromLastPlayedInWeeks = differenceInCalendarWeeks(
    new Date(),
    lastPlayed ?? new Date(),
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Text style="header-medium-semibold">{song.name}</Text>
        <SongKey size="medium" songKey={song.preferredKey} />
      </div>
      <div className="flex gap-3">
        {lastPlayed ? (
          <div className="flex items-center gap-1">
            <ClockCounterClockwise className="text-slate-400" size="8px" />
            <Text style="body-small" className="text-slate-500">
              {distanceFromLastPlayedInWeeks > 0
                ? `${distanceFromLastPlayedInWeeks}w`
                : `${distanceFromLastPlayedInDays}d`}
            </Text>
          </div>
        ) : (
          <Text style="body-small" className="text-slate-500">
            Never played
          </Text>
        )}
        {tags && tags.length > 0 && (
          <div className="flex gap-2">
            {tags.map((tag) => (
              <Badge key={tag} label={tag} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
