import { ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr";

import { HighlightedText } from "@components/HighlightedText";
import { HStack } from "@components/HStack";
import { SongKey } from "@components/SongKey";
import { Text } from "@components/Text";

import { getSongContext } from "./searchResultContext";
import { type SearchSongResult } from "./types";

export const SearchSongRow = ({
  query,
  result,
}: {
  query: string;
  result: SearchSongResult;
}) => (
  <div className="min-w-0 flex-1">
    <HStack className="w-fit max-w-full min-w-0 items-center gap-2">
      <Text
        style="header-small-semibold"
        className="min-w-0 truncate text-slate-500"
      >
        <HighlightedText query={query} text={result.name} />
      </Text>
      <SongKey size="medium" songKey={result.preferredKey} />
    </HStack>
    <HStack className="mt-1 min-w-0 items-center gap-1 text-xs text-slate-500">
      <ClockCounterClockwise
        aria-hidden
        size={12}
        className="shrink-0 text-slate-400"
      />
      <span className="truncate">
        <HighlightedText query={query} text={getSongContext(result)} />
      </span>
    </HStack>
  </div>
);
