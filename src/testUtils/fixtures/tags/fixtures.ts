import { createFixtureTimestamp } from "@testUtils/fixtures/shared/generators";
import { createUuid } from "@testUtils/generators/createUuid";

import { type NewSongTag, type SongTag, type Tag } from "@lib/types";

import { createTagName } from "./generators";

export const createTagFixture = (overrides: Partial<Tag> = {}): Tag => ({
  id: createUuid(),
  tag: createTagName(),
  organizationId: createUuid(),
  createdAt: createFixtureTimestamp(),
  updatedAt: createFixtureTimestamp(),
  ...overrides,
});

export const createSongTagFixture = (
  overrides: Partial<SongTag> = {},
): SongTag => ({
  songId: createUuid(),
  tagId: createUuid(),
  createdAt: createFixtureTimestamp(),
  updatedAt: createFixtureTimestamp(),
  ...overrides,
});

export const createNewSongTagFixture = (
  overrides: Partial<NewSongTag> = {},
): NewSongTag => ({
  songId: createUuid(),
  tagId: createUuid(),
  ...overrides,
});
