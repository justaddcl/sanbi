import { createFixtureTimestamp } from "@testUtils/fixtures/shared/generators";
import { createUserId } from "@testUtils/fixtures/users";
import { createUuid } from "@testUtils/generators/createUuid";

import { type NewSong, type Song } from "@lib/types";

import { createSongKey, createSongName } from "./generators";

export const createSongFixture = (overrides: Partial<Song> = {}): Song => ({
  id: createUuid(),
  name: createSongName(),
  preferredKey: createSongKey(),
  notes: null,
  tempo: null,
  createdBy: createUserId(),
  organizationId: createUuid(),
  isArchived: false,
  favoritedAt: null,
  createdAt: createFixtureTimestamp(),
  updatedAt: createFixtureTimestamp(),
  ...overrides,
});

export const createNewSongFixture = (
  overrides: Partial<NewSong> = {},
): NewSong => ({
  name: createSongName(),
  preferredKey: createSongKey(),
  notes: null,
  tempo: null,
  createdBy: createUserId(),
  organizationId: createUuid(),
  isArchived: false,
  favoritedAt: null,
  ...overrides,
});
