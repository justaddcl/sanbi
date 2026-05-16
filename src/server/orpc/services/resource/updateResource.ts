import { ORPCError } from "@orpc/server";
import { type z } from "zod";

import { type getRouteLogger } from "@lib/loggers/logger";
import { type Resource } from "@lib/types";
import { type updateResourceSchema } from "@lib/types/zod";
import { validateUrl } from "@server/utils/urls/validateUrl";

type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

type ResourceUpdateValues = Pick<Resource, "title" | "url">;
type UpdateResourceLogger = NonNullable<ReturnType<typeof getRouteLogger>>;

export type UpdateResourceData = {
  findResourceById: (resourceId: string) => Promise<Resource | null>;
  updateResource: (
    resourceId: string,
    values: Partial<ResourceUpdateValues>,
  ) => Promise<Resource | null>;
};

export const POSTGRES_UNIQUE_CONSTRAINT_VIOLATION_CODE = "23505";

type UpdateResourceForOrganizationOptions = {
  input: UpdateResourceInput;
  userOrganizationId: string;
  resourceData: UpdateResourceData;
  logger?: UpdateResourceLogger;
};

const isUniqueConstraintViolation = (error: unknown) =>
  error instanceof Error &&
  "code" in error &&
  error.code === POSTGRES_UNIQUE_CONSTRAINT_VIOLATION_CODE;

export const updateResourceForOrganization = async ({
  input,
  userOrganizationId,
  resourceData,
  logger,
}: UpdateResourceForOrganizationOptions) => {
  const { resourceId, organizationId, url, title } = input;

  if (organizationId !== userOrganizationId) {
    logger?.warn?.(
      "User is not authorized to update resources for this organization",
    );

    throw new ORPCError("FORBIDDEN", {
      message:
        "User is not authorized to update resources for this organization",
    });
  }

  const resourceToUpdate = await resourceData.findResourceById(resourceId);

  if (!resourceToUpdate) {
    logger?.warn?.("Could not find song resource");

    throw new ORPCError("NOT_FOUND", {
      message: "Could not find target song resource",
    });
  }

  if (resourceToUpdate.organizationId !== organizationId) {
    logger?.warn?.("Song resource is not associated with organization");

    throw new ORPCError("FORBIDDEN", {
      message: "Song resource is not associated with this organization",
    });
  }

  const updateValues: Partial<ResourceUpdateValues> = {};

  if (title !== undefined && title !== resourceToUpdate.title) {
    updateValues.title = title;
  }

  if (url !== undefined) {
    const validatedUrl = validateUrl(url);

    if (validatedUrl !== resourceToUpdate.url) {
      updateValues.url = validatedUrl;
    }
  }

  if (Object.keys(updateValues).length === 0) {
    logger?.info?.("No updates needed");
    return resourceToUpdate;
  }

  try {
    const updatedResource = await resourceData.updateResource(
      resourceId,
      updateValues,
    );

    if (!updatedResource) {
      logger?.error?.("Could not update resource");

      throw new ORPCError("CONFLICT", {
        message: "Could not update resource",
      });
    }

    logger?.info?.("Song resource has been updated!");

    return updatedResource;
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      logger?.warn?.("URL conflict detected");

      throw new ORPCError("CONFLICT", {
        message: "A resource with this URL already exists for this song",
      });
    }

    throw error;
  }
};
