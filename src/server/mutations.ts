import { type NewOrganization } from "@/lib/types";
import "server-only";
import { TRPCError } from "@trpc/server";
import { api } from "@/trpc/server";
import { auth } from "@clerk/nextjs/server";

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

    const newOrganizationMembership = await api.organizationMemberships.create({
      userId: userId!,
      organizationId: newOrganization!.id,
      permissionType: "owner", // the user that creates the organization should get `owner` permissions
    });

    return { newOrganization, newOrganizationMembership };
  } catch (createOrganizationAndAddUserError) {
    // TODO: capture error and send to Sentry?
    if (createOrganizationAndAddUserError instanceof TRPCError) {
      console.error(
        "Ran into an issue while creating a new organization and adding the user: ",
        createOrganizationAndAddUserError.message,
      );
      throw new TRPCError(createOrganizationAndAddUserError);
    }
  }
}
