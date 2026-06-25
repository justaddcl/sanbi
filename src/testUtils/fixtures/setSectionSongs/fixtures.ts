import { createFixtureTimestamp } from "@testUtils/fixtures/shared/generators";
import { createSongFixture, createSongKey } from "@testUtils/fixtures/songs";
import { createUuid } from "@testUtils/generators/createUuid";

import {
  type NewSetSectionSong,
  type SetSectionSong,
  type SetSectionSongWithSongData,
} from "@lib/types";

export const createSetSectionSongFixture = (
  overrides: Partial<SetSectionSong> = {},
): SetSectionSong => ({
  id: createUuid(),
  setSectionId: createUuid(),
  songId: createUuid(),
  position: 0,
  key: createSongKey(),
  notes: null,
  organizationId: createUuid(),
  createdAt: createFixtureTimestamp(),
  updatedAt: createFixtureTimestamp(),
  ...overrides,
});

export const createNewSetSectionSongFixture = (
  overrides: Partial<NewSetSectionSong> = {},
): NewSetSectionSong => ({
  setSectionId: createUuid(),
  songId: createUuid(),
  position: 0,
  key: createSongKey(),
  notes: null,
  organizationId: createUuid(),
  ...overrides,
});

export const createSetSectionSongWithSongDataFixture = (
  overrides: Partial<SetSectionSongWithSongData> = {},
): SetSectionSongWithSongData => {
  const { song: songOverride, ...setSectionSongOverrides } = overrides;
  const songId =
    setSectionSongOverrides.songId ?? songOverride?.id ?? createUuid();
  const organizationId =
    setSectionSongOverrides.organizationId ??
    songOverride?.organizationId ??
    createUuid();
  const song = createSongFixture({
    id: songId,
    organizationId,
    ...songOverride,
  });

  return {
    ...createSetSectionSongFixture({
      songId,
      organizationId,
      ...setSectionSongOverrides,
    }),
    song,
  };
};
