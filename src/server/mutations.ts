"use server";

import {
  type Organization,
  type NewOrganization,
  type OrganizationMembership,
} from "@/lib/types";
import "server-only";
import { TRPCError } from "@trpc/server";
import { api } from "@/trpc/server";
import { auth } from "@clerk/nextjs/server";
import { type CreateTeamFormFields } from "@/modules/onboarding/createTeam";

export type CreateOrganizationAndAddUserData = {
  organization?: Organization;
  organizationMembership?: OrganizationMembership;
};

export type CreateOrganizationAndAddUserError = TRPCError & {
  path: keyof Omit<CreateTeamFormFields, "id">;
};

export type CreateOrganizationAndAddUserResult =
  | {
      data?: never;
      errors: CreateOrganizationAndAddUserError[];
    }
  | {
      data: CreateOrganizationAndAddUserData;
      errors?: never;
    };

export async function createOrganizationAndAddUser(
  newOrganizationInput: NewOrganization,
) {
  const { userId, redirectToSignIn } = auth();

  if (!userId) {
    redirectToSignIn();
  }

  try {
    const [newOrganization] =
      await api.organization.create(newOrganizationInput);

    const [newOrganizationMembership] =
      await api.organizationMemberships.create({
        userId: userId!,
        organizationId: newOrganization!.id,
        permissionType: "owner", // the user that creates the organization should get `owner` permissions
      });

    const payload: CreateOrganizationAndAddUserData = {
      organization: newOrganization,
      organizationMembership: newOrganizationMembership,
    };

    return { data: payload, errors: null };
  } catch (createOrganizationAndAddUserError) {
    // TODO: capture error and send to Sentry?
    if (createOrganizationAndAddUserError instanceof TRPCError) {
      const payload: CreateOrganizationAndAddUserResult = {
        errors: [
          {
            ...createOrganizationAndAddUserError,
            message: createOrganizationAndAddUserError.message,
            path: createOrganizationAndAddUserError.cause
              ?.cause as CreateOrganizationAndAddUserError["path"],
          },
        ],
      };
      return payload;
    }
  }
}
