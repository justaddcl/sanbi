import { faker } from "@faker-js/faker";

import { type User, type UserWithMemberships } from "@lib/types";

import { createUuid } from "../../generators/createUuid";

type UserWithMembershipsFixture = NonNullable<UserWithMemberships>;
type MembershipFixture = UserWithMembershipsFixture["memberships"][number];
type UserPreferencesFixture = NonNullable<
  UserWithMembershipsFixture["preferences"]
>;

export const createUserFixture = (
  overrides: Partial<User> = {},
): User => ({
  id: overrides.id ?? "user_123",
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  onboardingStep: "createTeam",
  onboardingCompletedAt: null,
  authDeletedAt: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  ...overrides,
});

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
  const user = createUserFixture(overrides);

  return {
    ...user,
    preferences: createUserPreferencesFixture({ userId: user.id }),
    memberships: [createOrganizationMembershipFixture({ userId: user.id })],
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
