import { Tag } from "@phosphor-icons/react/dist/ssr";

import { HighlightedText } from "@components/HighlightedText";
import { HStack } from "@components/HStack";
import { SongKey } from "@components/SongKey";
import { Text } from "@components/Text";

import {
  getLastPlayedContext,
  getMatchedTagContext,
} from "./searchResultContext";
import { type TagSearchResult } from "./types";

type SearchTagMatchedSongRowProps = {
  query: string;
  result: TagSearchResult;
};

export const SearchTagMatchedSongRow = ({
  query,
  result,
}: SearchTagMatchedSongRowProps) => (
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
      <Tag aria-hidden className="size-3! shrink-0 text-slate-400" />
      <span className="min-w-0 truncate">
        <HighlightedText query={query} text={getMatchedTagContext(result)} />
      </span>
      <span aria-hidden className="shrink-0 text-slate-300">
        ·
      </span>
      <span className="shrink-0">
        {getLastPlayedContext(result.lastPlayedDate)}
      </span>
    </HStack>
  </div>
);
