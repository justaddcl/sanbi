import { TRPCError } from "@trpc/server";
import { type z } from "zod";

import { type AppLogger } from "@lib/loggers/logger";
import { type Resource } from "@lib/types";
import { type updateResourceSchema } from "@lib/types/zod";
import { isUniqueConstraintViolation } from "@server/utils/db/postgres";

import {
  resolveResourceMetadataForUrl,
  type ResourceMetadataWriteValues,
} from "./resourceMetadata";
import { validateResourceUrl } from "./validateResourceUrl";

type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

type ResourceUpdateValues = Pick<Resource, "title" | "url"> &
  ResourceMetadataWriteValues;

export type UpdateResourceDataAccess = {
  findResourceById: (resourceId: string) => Promise<Resource | null>;
  updateResource: (
    resourceId: string,
    values: Partial<ResourceUpdateValues>,
  ) => Promise<Resource | null>;
};

type UpdateResourceForOrganizationOptions = {
  input: UpdateResourceInput;
  userOrganizationId: string;
  resourceDataAccess: UpdateResourceDataAccess;
  logger?: AppLogger;
};

export const updateResourceForOrganization = async ({
  input,
  userOrganizationId,
  resourceDataAccess,
  logger,
}: UpdateResourceForOrganizationOptions) => {
  const { resourceId, organizationId, url, title } = input;

  if (organizationId !== userOrganizationId) {
    logger?.warn?.(
      "User is not authorized to update resources for this organization",
    );

    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "User is not authorized to update resources for this organization",
    });
  }

  const resourceToUpdate =
    await resourceDataAccess.findResourceById(resourceId);

  if (!resourceToUpdate) {
    logger?.warn?.("Could not find song resource");

    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Could not find target song resource",
    });
  }

  if (resourceToUpdate.organizationId !== organizationId) {
    logger?.warn?.("Song resource is not associated with organization");

    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Song resource is not associated with this organization",
    });
  }

  const updateValues: Partial<ResourceUpdateValues> = {};

  if (title !== undefined) {
    const trimmedTitle = title?.trim() ?? null;
    const nextTitle = trimmedTitle === "" ? null : trimmedTitle;

    if (nextTitle !== resourceToUpdate.title) {
      updateValues.title = nextTitle;
    }
  }

  if (url !== undefined) {
    const validatedUrl = validateResourceUrl(url);

    if (validatedUrl !== resourceToUpdate.url) {
      const { normalizedUrl, metadataValues } =
        await resolveResourceMetadataForUrl(validatedUrl);

      updateValues.url = normalizedUrl;
      Object.assign(updateValues, metadataValues);
    }
  }

  if (Object.keys(updateValues).length === 0) {
    logger?.info?.("No updates needed");
    return resourceToUpdate;
  }

  try {
    const updatedResource = await resourceDataAccess.updateResource(
      resourceId,
      updateValues,
    );

    if (!updatedResource) {
      logger?.error?.("Could not update resource");

      throw new TRPCError({
        code: "CONFLICT",
        message: "Could not update resource",
      });
    }

    logger?.info?.("Song resource has been updated!");

    return updatedResource;
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      logger?.warn?.("URL conflict detected");

      throw new TRPCError({
        code: "CONFLICT",
        message: "A resource with this URL already exists for this song",
      });
    }

    throw error;
  }
};
