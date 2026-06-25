import { createFixtureTimestamp } from "@testUtils/fixtures/shared/generators";
import { createUserId } from "@testUtils/fixtures/users";
import { createUuid } from "@testUtils/generators/createUuid";

import {
  type Organization,
  type OrganizationMembership,
  type OrganizationMembershipWithOrganization,
} from "@lib/types";

import { createOrganizationName, createOrganizationSlug } from "./generators";

export const createOrganizationFixture = (
  overrides: Partial<Organization> = {},
): Organization => {
  const name = overrides.name ?? createOrganizationName();

  return {
    id: createUuid(),
    name,
    slug: createOrganizationSlug(name),
    createdAt: createFixtureTimestamp(),
    updatedAt: createFixtureTimestamp(),
    ...overrides,
  };
};

export const createOrganizationMembershipFixture = (
  overrides: Partial<OrganizationMembership> = {},
): OrganizationMembership => ({
  organizationId: createUuid(),
  userId: createUserId(),
  permissionType: "admin",
  createdAt: createFixtureTimestamp(),
  updatedAt: createFixtureTimestamp(),
  ...overrides,
});

export const createOrganizationMembershipWithOrganizationFixture = (
  overrides: Partial<OrganizationMembershipWithOrganization> = {},
): OrganizationMembershipWithOrganization => {
  const { organization: organizationOverride, ...membershipOverrides } =
    overrides;
  const organization =
    organizationOverride ?? createOrganizationFixture(organizationOverride);

  return {
    ...createOrganizationMembershipFixture({
      organizationId: organization.id,
      ...membershipOverrides,
    }),
    organization,
  };
};
