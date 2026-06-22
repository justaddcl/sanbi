import {
  ArchiveIcon,
  ClockCounterClockwiseIcon,
} from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@components/ui/badge";
import { HighlightedText } from "@components/HighlightedText";
import { HStack } from "@components/HStack";
import { SongKey } from "@components/SongKey";
import { Text } from "@components/Text";

import { getSongContext } from "./searchResultContext";
import { type SearchSongResult } from "./types";

type SearchSongRowProps = {
  query: string;
  result: SearchSongResult;
};

export const SearchSongRow = ({ query, result }: SearchSongRowProps) => (
  <div className="min-w-0 flex-1">
    <HStack className="w-fit max-w-full min-w-0 items-center gap-2">
      <Text
        style="header-small-semibold"
        className="min-w-0 truncate text-slate-500"
      >
        <HighlightedText
          highlightWhenNoExactMatch
          query={query}
          text={result.name}
        />
      </Text>
      <SongKey size="medium" songKey={result.preferredKey} />
      {result.isArchived && (
        <Badge
          variant="warn"
          className="shrink-0 gap-1 px-1.5 py-0 text-[10px]"
        >
          <ArchiveIcon aria-hidden size={11} />
          Archived
        </Badge>
      )}
    </HStack>
    <HStack className="mt-1 min-w-0 items-center gap-1 text-xs text-slate-500">
      <ClockCounterClockwiseIcon
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
