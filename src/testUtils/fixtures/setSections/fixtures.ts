import { createSetSectionSongWithSongDataFixture } from "@testUtils/fixtures/setSectionSongs";
import { createSetSectionTypeFixture } from "@testUtils/fixtures/setSectionTypes";
import { createFixtureTimestamp } from "@testUtils/fixtures/shared/generators";
import { createUuid } from "@testUtils/generators/createUuid";

import {
  type NewSetSection,
  type SetSection,
  type SetSectionWithSongs,
} from "@lib/types";

export const createSetSectionFixture = (
  overrides: Partial<SetSection> = {},
): SetSection => ({
  id: createUuid(),
  setId: createUuid(),
  position: 0,
  sectionTypeId: createUuid(),
  organizationId: createUuid(),
  createdAt: createFixtureTimestamp(),
  updatedAt: createFixtureTimestamp(),
  ...overrides,
});

export const createNewSetSectionFixture = (
  overrides: Partial<NewSetSection> = {},
): NewSetSection => ({
  setId: createUuid(),
  position: 0,
  sectionTypeId: createUuid(),
  organizationId: createUuid(),
  ...overrides,
});

export const createSetSectionWithSongsFixture = (
  overrides: Partial<SetSectionWithSongs> = {},
): SetSectionWithSongs => {
  const {
    songs: songsOverride,
    type: typeOverride,
    ...setSectionOverrides
  } = overrides;
  const organizationId = setSectionOverrides.organizationId ?? createUuid();
  const sectionTypeId =
    setSectionOverrides.sectionTypeId ?? typeOverride?.id ?? createUuid();
  const setSectionId = setSectionOverrides.id ?? createUuid();
  const type = createSetSectionTypeFixture({
    id: sectionTypeId,
    organizationId,
    ...typeOverride,
  });
  const songs = songsOverride ?? [
    createSetSectionSongWithSongDataFixture({
      setSectionId,
      organizationId,
      position: 0,
    }),
  ];

  return {
    ...createSetSectionFixture({
      id: setSectionId,
      sectionTypeId,
      organizationId,
      ...setSectionOverrides,
    }),
    type,
    songs,
  };
};
