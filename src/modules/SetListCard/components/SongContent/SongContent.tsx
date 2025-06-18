import unescapeHTML from "validator/es/lib/unescape";

import { HStack } from "@components/HStack";
import { SongKey } from "@components/SongKey";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { type Song } from "@lib/types";
import { cn } from "@lib/utils";

export type SongContentProps = {
  songKey?: Song["preferredKey"];

  name: Song["name"];

  notes?: string | null;

  /** The 1-based index position of this song in the overall set list */
  index?: number;

  disabled?: boolean;

  className?: string;
};

/**
 * Displays the core content of a song item including index number, key, title and notes
 * Used as an internal component within SongItem
 */
export const SongContent: React.FC<SongContentProps> = ({
  songKey,
  name,
  notes,
  index,
  disabled,
  className,
}) => {
  return (
    <HStack
      className={cn(
        "w-full items-baseline gap-3 text-xs font-semibold",
        className,
      )}
    >
      {index && (
        <Text
          style="header-medium-semibold"
          align="right"
          className="min-w-4 text-slate-400"
        >
          {index}.
        </Text>
      )}
      <VStack className="flex flex-grow flex-col gap-4">
        <HStack className="flex items-baseline gap-2">
          {songKey && <SongKey songKey={songKey} />}
          <Text
            fontWeight="semibold"
            className={cn("text-sm", { "text-slate-500": disabled })}
          >
            {name}
          </Text>
        </HStack>
        {notes ? (
          <Text style="small" color="slate-700">
            {unescapeHTML(notes)}
          </Text>
        ) : null}
      </VStack>
    </HStack>
  );
};
