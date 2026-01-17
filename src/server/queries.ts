import { redirect } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { validate as uuidValidate } from "uuid";

import { trpc } from "@lib/trpc/server";

export async function getOrganization(organizationId: string) {
  if (!uuidValidate(organizationId)) {
    console.error(
      `🤖 - ${organizationId} is not a valid UUID - queries/getOrganization`,
    );
    redirect("/");
  }

  try {
    const organization = await trpc.organization.organization({
      organizationId,
    });
    return organization;
  } catch (fetchOrganizationError) {
    if (fetchOrganizationError instanceof TRPCError) {
      switch (fetchOrganizationError.code) {
        case "FORBIDDEN":
        default:
          console.error(
            `🤖 - [queries/getOrganization/${organizationId}]: ${fetchOrganizationError.message}`,
          );
          redirect("/");
      }
    }
  }
}
