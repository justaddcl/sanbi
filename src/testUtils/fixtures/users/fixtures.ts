import { createFixtureTimestamp } from "@testUtils/fixtures/shared/generators";

import { type User } from "@lib/types";

import {
  createUserEmail,
  createUserFirstName,
  createUserId,
  createUserLastName,
} from "./generators";

export const createUserFixture = (overrides: Partial<User> = {}): User => ({
  id: createUserId(),
  firstName: createUserFirstName(),
  lastName: createUserLastName(),
  email: createUserEmail(),
  createdAt: createFixtureTimestamp(),
  updatedAt: createFixtureTimestamp(),
  ...overrides,
});
