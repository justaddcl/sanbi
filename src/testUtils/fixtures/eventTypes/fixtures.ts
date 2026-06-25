import { createFixtureTimestamp } from "@testUtils/fixtures/shared/generators";
import { createUuid } from "@testUtils/generators/createUuid";

import { type EventType } from "@lib/types";

import { createEventTypeName } from "./generators";

export const createEventTypeFixture = (
  overrides: Partial<EventType> = {},
): EventType => ({
  id: createUuid(),
  name: createEventTypeName(),
  organizationId: createUuid(),
  favoritedAt: null,
  createdAt: createFixtureTimestamp(),
  updatedAt: createFixtureTimestamp(),
  ...overrides,
});
