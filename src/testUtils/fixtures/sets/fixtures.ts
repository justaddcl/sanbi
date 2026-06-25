import {
  createEventTypeFixture,
  createEventTypeName,
} from "@testUtils/fixtures/eventTypes";
import {
  createOrganizationFixture,
  createOrganizationMembershipWithOrganizationFixture,
} from "@testUtils/fixtures/organizations";
import { createResourceFixture } from "@testUtils/fixtures/resources";
import {
  createSetSectionFixture,
  createSetSectionWithSongsFixture,
} from "@testUtils/fixtures/setSections";
import { createSetSectionSongWithSongDataFixture } from "@testUtils/fixtures/setSectionSongs";
import { createSetSectionTypeFixture } from "@testUtils/fixtures/setSectionTypes";
import {
  createFixtureDate,
  createFixtureTimestamp,
} from "@testUtils/fixtures/shared/generators";
import { createSongFixture } from "@testUtils/fixtures/songs";
import {
  createSongTagFixture,
  createTagFixture,
} from "@testUtils/fixtures/tags";
import { createUserFixture } from "@testUtils/fixtures/users";
import { createUuid } from "@testUtils/generators/createUuid";

import {
  type NewSet,
  type SetType,
  type SetWithSectionsSongsAndEventType,
} from "@lib/types";

export const createSetFixture = (
  overrides: Partial<SetType> = {},
): SetType => ({
  id: createUuid(),
  eventTypeId: createUuid(),
  date: createFixtureDate(),
  notes: null,
  organizationId: createUuid(),
  isArchived: false,
  createdAt: createFixtureTimestamp(),
  updatedAt: createFixtureTimestamp(),
  ...overrides,
});

export const createNewSetFixture = (
  overrides: Partial<NewSet> = {},
): NewSet => ({
  eventTypeId: createUuid(),
  date: createFixtureDate(),
  notes: null,
  organizationId: createUuid(),
  isArchived: false,
  ...overrides,
});

export const createSetWithSectionsSongsAndEventTypeFixture = (
  overrides: Partial<SetWithSectionsSongsAndEventType> = {},
): SetWithSectionsSongsAndEventType => {
  const {
    eventType: eventTypeOverride,
    sections: sectionsOverride,
    ...setOverrides
  } = overrides;
  const organizationId = setOverrides.organizationId ?? createUuid();
  const eventTypeId =
    setOverrides.eventTypeId ?? eventTypeOverride?.id ?? createUuid();
  const setId = setOverrides.id ?? createUuid();
  const eventType = createEventTypeFixture({
    id: eventTypeId,
    organizationId,
    name: eventTypeOverride?.name ?? createEventTypeName(),
    ...eventTypeOverride,
  });
  const sections = sectionsOverride ?? [
    createSetSectionWithSongsFixture({
      setId,
      organizationId,
      position: 0,
    }),
  ];

  return {
    ...createSetFixture({
      id: setId,
      eventTypeId,
      organizationId,
      ...setOverrides,
    }),
    eventType,
    sections,
  };
};

export const createSetDomainFixture = () => {
  const organization = createOrganizationFixture();
  const user = createUserFixture();
  const membership = createOrganizationMembershipWithOrganizationFixture({
    organization,
    organizationId: organization.id,
    userId: user.id,
  });
  const eventType = createEventTypeFixture({
    organizationId: organization.id,
  });
  const set = createSetFixture({
    eventTypeId: eventType.id,
    organizationId: organization.id,
  });
  const sectionType = createSetSectionTypeFixture({
    organizationId: organization.id,
  });
  const setSection = createSetSectionFixture({
    setId: set.id,
    sectionTypeId: sectionType.id,
    organizationId: organization.id,
  });
  const song = createSongFixture({
    createdBy: user.id,
    organizationId: organization.id,
  });
  const setSectionSong = createSetSectionSongWithSongDataFixture({
    setSectionId: setSection.id,
    songId: song.id,
    organizationId: organization.id,
    song,
  });
  const tag = createTagFixture({ organizationId: organization.id });
  const songTag = createSongTagFixture({ songId: song.id, tagId: tag.id });
  const resource = createResourceFixture({
    songId: song.id,
    organizationId: organization.id,
  });
  const setWithSections = createSetWithSectionsSongsAndEventTypeFixture({
    ...set,
    eventType,
    sections: [
      {
        ...setSection,
        type: sectionType,
        songs: [setSectionSong],
      },
    ],
  });

  return {
    organization,
    user,
    membership,
    eventType,
    set,
    sectionType,
    setSection,
    song,
    setSectionSong,
    tag,
    songTag,
    resource,
    setWithSections,
  };
};
