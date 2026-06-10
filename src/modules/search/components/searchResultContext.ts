import { differenceInCalendarDays, differenceInCalendarWeeks } from "date-fns";

import { type SearchSongResult, type TagSearchResult } from "./types";

export const getLastPlayedContext = (lastPlayedDate: Date | null) => {
  if (!lastPlayedDate) {
    return "Never played";
  }

  const distanceFromLastPlayedInDays = differenceInCalendarDays(
    new Date(),
    lastPlayedDate,
  );
  const distanceFromLastPlayedInWeeks = differenceInCalendarWeeks(
    new Date(),
    lastPlayedDate,
  );

  if (distanceFromLastPlayedInWeeks > 0) {
    return `Last played ${distanceFromLastPlayedInWeeks}w ago`;
  }

  return `Last played ${distanceFromLastPlayedInDays}d ago`;
};

export const getSongContext = (result: SearchSongResult) => {
  const tags = result.tags ?? [];
  const tagPreview = tags.slice(0, 2).join(", ");
  const hiddenTagCount = tags.length - 2;

  if (!tagPreview) {
    return getLastPlayedContext(result.lastPlayedDate);
  }

  const tagContext =
    hiddenTagCount > 0 ? `${tagPreview}, ${hiddenTagCount} more` : tagPreview;

  return `${getLastPlayedContext(result.lastPlayedDate)} · ${tagContext}`;
};

export const getMatchedTagContext = (result: TagSearchResult) => {
  const matchedTagPreview = result.matchedTags.slice(0, 2).join(", ");
  const hiddenTagCount = result.matchedTags.length - 2;

  if (hiddenTagCount > 0) {
    return `${matchedTagPreview}, ${hiddenTagCount} more`;
  }

  return matchedTagPreview;
};
