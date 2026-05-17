import { faker } from "@faker-js/faker";

import { type UserWithMemberships } from "@lib/types";

import { createUuid } from "../../generators/createUuid";

type UserWithMembershipsFixture = NonNullable<UserWithMemberships>;
type MembershipFixture = UserWithMembershipsFixture["memberships"][number];
type UserPreferencesFixture = NonNullable<
  UserWithMembershipsFixture["preferences"]
>;

export const createOrganizationMembershipFixture = (
  overrides: Partial<MembershipFixture> = {},
): MembershipFixture => {
  const organizationId = overrides.organizationId ?? createUuid();
  const organizationName = faker.company.name();

  return {
    organizationId,
    userId: "user_123",
    permissionType: "admin",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    organization: {
      id: organizationId,
      name: organizationName,
      slug: faker.helpers.slugify(organizationName).toLowerCase(),
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    },
    ...overrides,
  };
};

export const createUserWithMembershipsFixture = (
  overrides: Partial<UserWithMembershipsFixture> = {},
): UserWithMembershipsFixture => {
  const userId = overrides.id ?? "user_123";

  return {
    id: userId,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    preferences: createUserPreferencesFixture({ userId }),
    memberships: [createOrganizationMembershipFixture({ userId })],
    ...overrides,
  };
};

export const createUserPreferencesFixture = (
  overrides: Partial<UserPreferencesFixture> = {},
): UserPreferencesFixture => ({
  userId: "user_123",
  confirmResourceDelete: true,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  ...overrides,
});
