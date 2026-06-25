import { createFixtureTimestamp } from "@testUtils/fixtures/shared/generators";
import { createUuid } from "@testUtils/generators/createUuid";

import { type SetSectionTypeType } from "@lib/types";

import { createSetSectionTypeName } from "./generators";

export const createSetSectionTypeFixture = (
  overrides: Partial<SetSectionTypeType> = {},
): SetSectionTypeType => ({
  id: createUuid(),
  name: createSetSectionTypeName(),
  organizationId: createUuid(),
  createdAt: createFixtureTimestamp(),
  updatedAt: createFixtureTimestamp(),
  ...overrides,
});
