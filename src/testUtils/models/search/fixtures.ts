import { faker } from "@faker-js/faker";

import { type SearchSongResult } from "@modules/search/components/types";

import { createUuid } from "../../generators/createUuid";

export const createSearchSongResultFixture = (
  overrides: Partial<SearchSongResult> = {},
): SearchSongResult => ({
  songId: createUuid(),
  name: faker.music.songName(),
  preferredKey: "g",
  isArchived: false,
  similarityScore: faker.number.float({ min: 0, max: 1 }),
  tags: [faker.music.genre(), faker.music.genre()],
  matchedTags: [],
  lastPlayedDate: null,
  ...overrides,
});
