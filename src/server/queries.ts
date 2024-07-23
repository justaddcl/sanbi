import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";
import { validate as uuidValidate } from "uuid";

export async function getOrganization(organizationId: string) {
  if (!uuidValidate(organizationId)) {
    redirect("/");
  }

  try {
    const organization = await api.organization.organization({
      organizationId,
    });
    return organization;
  } catch (fetchOrganizationError) {
    if (fetchOrganizationError instanceof TRPCError) {
      switch (fetchOrganizationError.code) {
        case "FORBIDDEN":
          // TODO: capture Sentry error?
          console.error(
            `queries/getOrganization/${organizationId}: ${fetchOrganizationError.message}`,
          );
        default:
          redirect("/");
      }
    }
  }
}
