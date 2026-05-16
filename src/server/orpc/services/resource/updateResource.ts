import { ORPCError } from "@orpc/server";
import { type z } from "zod";

import { type Resource } from "@lib/types";
import { type updateResourceSchema } from "@lib/types/zod";
import { validateUrl } from "@server/utils/urls/validateUrl";

type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

type ResourceUpdateValues = Pick<Resource, "title" | "url">;

export type UpdateResourceRepository = {
  findResourceById: (resourceId: string) => Promise<Resource | null>;
  updateResource: (
    resourceId: string,
    values: Partial<ResourceUpdateValues>,
  ) => Promise<Resource | null>;
};

type UpdateResourceLogger = {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
};

type UpdateResourceForOrganizationOptions = {
  input: UpdateResourceInput;
  userOrganizationId: string;
  repository: UpdateResourceRepository;
  logger?: Partial<UpdateResourceLogger>;
};

const isUniqueConstraintViolation = (error: unknown) =>
  error instanceof Error && "code" in error && error.code === "23505";

export const updateResourceForOrganization = async ({
  input,
  userOrganizationId,
  repository,
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

  const resourceToUpdate = await repository.findResourceById(resourceId);

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
    const updatedResource = await repository.updateResource(
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
