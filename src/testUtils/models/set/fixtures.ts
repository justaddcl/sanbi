import { faker } from "@faker-js/faker";
import { createUuid } from "@testUtils/generators/createUuid";

type OrganizationSetFixture = {
  id: string;
  eventTypeId: string;
  date: string;
  notes: string | null;
  organizationId: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  sections: [];
  eventType: {
    id: string;
    name: string;
    organizationId: string;
    favoritedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

export const createOrganizationSetFixture = (
  overrides: Partial<OrganizationSetFixture> = {},
): OrganizationSetFixture => {
  const organizationId = overrides.organizationId ?? createUuid();
  const eventTypeId = overrides.eventTypeId ?? createUuid();

  return {
    id: createUuid(),
    eventTypeId,
    date: "2026-06-25",
    notes: null,
    organizationId,
    isArchived: false,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    sections: [],
    eventType: {
      id: eventTypeId,
      name: faker.music.genre(),
      organizationId,
      favoritedAt: null,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    },
    ...overrides,
  };
};
