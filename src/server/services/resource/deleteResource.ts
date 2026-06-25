import { TRPCError } from "@trpc/server";
import { type z } from "zod";

import { type getRouteLogger } from "@lib/loggers/logger";
import { type Resource } from "@lib/types";
import { type deleteResourceSchema } from "@lib/types/zod";

type DeleteResourceInput = z.infer<typeof deleteResourceSchema>;
type DeleteResourceLogger = NonNullable<ReturnType<typeof getRouteLogger>>;

export type DeleteResourceDataAccess = {
  findResourceById: (resourceId: string) => Promise<Resource | null>;
  deleteResource: (
    resourceId: string,
    organizationId: string,
  ) => Promise<Resource | null>;
};

type DeleteResourceForOrganizationOptions = {
  input: DeleteResourceInput;
  userOrganizationId: string;
  resourceDataAccess: DeleteResourceDataAccess;
  logger?: DeleteResourceLogger;
};

export const deleteResourceForOrganization = async ({
  input,
  userOrganizationId,
  resourceDataAccess,
  logger,
}: DeleteResourceForOrganizationOptions) => {
  const { resourceId, organizationId } = input;

  if (organizationId !== userOrganizationId) {
    logger?.warn?.(
      "User is not authorized to delete resources for this organization",
    );

    throw new TRPCError({
      code: "FORBIDDEN",
      message: "User is not authorized to delete resources for this organization",
    });
  }

  const resourceToDelete =
    await resourceDataAccess.findResourceById(resourceId);

  if (!resourceToDelete) {
    logger?.warn?.("Could not find song resource");

    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Could not find target song resource",
    });
  }

  if (resourceToDelete.organizationId !== organizationId) {
    logger?.warn?.("Song resource is not associated with organization");

    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Song resource is not associated with this organization",
    });
  }

  const deletedResource = await resourceDataAccess.deleteResource(
    resourceId,
    organizationId,
  );

  if (!deletedResource) {
    logger?.error?.("Could not delete resource");

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not delete resource",
    });
  }

  logger?.info?.("Song resource has been deleted");

  return deletedResource;
};
