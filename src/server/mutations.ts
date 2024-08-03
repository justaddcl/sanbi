"use server";

import {
  type Organization,
  type NewOrganization,
  type OrganizationMembership,
} from "@/lib/types";
import "server-only";
import { type TRPCError } from "@trpc/server";
import { api } from "@/trpc/server";
import { auth } from "@clerk/nextjs/server";
import { type CreateTeamFormFields } from "@/modules/onboarding/createTeam";
import {
  CreateOrganizationError,
  CreateOrganizationMembershipError,
} from "./api/routers";

export type CreateOrganizationAndAddUserData = {
  organization?: Organization;
  organizationMembership?: OrganizationMembership;
};

export type CreateOrganizationAndAddUserError = TRPCError & {
  path?: keyof Omit<CreateTeamFormFields, "id">;
};

export type CreateOrganizationAndAddUserResult =
  | {
      data: CreateOrganizationAndAddUserData;
      errors?: never;
    }
  | {
      data?: never;
      errors: CreateOrganizationAndAddUserError[];
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

    // FIXME: How should we handle if/when membership can't be created but the organization creation was successful? (User can't re-submit for duplicate values)
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
    if (createOrganizationAndAddUserError instanceof CreateOrganizationError) {
      const payload: CreateOrganizationAndAddUserResult = {
        errors: [
          {
            ...createOrganizationAndAddUserError,
            message: createOrganizationAndAddUserError.message,
            path: createOrganizationAndAddUserError.cause
              ?.message as keyof Omit<CreateTeamFormFields, "id">,
          },
        ],
      };
      return payload;
    }

    if (
      createOrganizationAndAddUserError instanceof
      CreateOrganizationMembershipError
    ) {
      // TODO: rollback the created organization so that the user can try again
      const payload: CreateOrganizationAndAddUserResult = {
        errors: [createOrganizationAndAddUserError],
      };
      return payload;
    }
  }
}
