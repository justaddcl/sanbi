import unescapeHTML from "validator/es/lib/unescape";

import { HStack } from "@components/HStack";
import { SongKey } from "@components/SongKey";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { type Song } from "@lib/types";
import { cn } from "@lib/utils";
import { useResponsive } from "@/hooks/useResponsive";

export type SongContentProps = {
  songKey?: Song["preferredKey"];

  name: Song["name"];

  notes?: string | null;

  /** The 1-based index position of this song in the overall set list */
  index?: number;

  muted?: boolean;

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
  muted,
  className,
}) => {
  const textStyles = {
    default: "font-semibold leading-tight text-slate-500 text-sm md:text-base",
    muted: "font-medium text-slate-300",
  };

  const { isMobile } = useResponsive();

  return (
    <HStack
      className={cn(
        "w-full items-baseline gap-3 text-xs font-semibold",
        className,
      )}
    >
      {index && (
        <Text
          align="right"
          className={cn(
            "min-w-4 font-semibold leading-tight text-slate-400 ",
            [textStyles.default],
            { [textStyles.muted]: muted },
          )}
        >
          {index}.
        </Text>
      )}
      <VStack className="flex flex-grow flex-col gap-4">
        <HStack className="flex items-baseline gap-2 md:items-center">
          {songKey && (
            <SongKey
              songKey={songKey}
              muted={muted}
              size={isMobile ? "small" : "medium"}
            />
          )}
          <Text
            fontWeight="semibold"
            className={cn("text-sm", [textStyles.default], "text-slate-900", {
              [textStyles.muted]: muted,
            })}
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
