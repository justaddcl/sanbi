import { TRPCError } from "@trpc/server";
import { type z } from "zod";

import { type AppLogger } from "@lib/loggers/logger";
import { type Resource } from "@lib/types";
import { type refreshResourceMetadataSchema } from "@lib/types/zod";
import { isUniqueConstraintViolation } from "@server/utils/db/postgres";

import {
  fetchResourcePreviewMetadata,
  type ResourceMetadataWriteValues,
  type ResourcePreviewMetadata,
  toResourceMetadataWriteValues,
} from "./resourceMetadata";

type RefreshResourceMetadataInput = z.infer<
  typeof refreshResourceMetadataSchema
>;
type ResourceRefreshMetadataValues = Pick<Resource, "url"> &
  ResourceMetadataWriteValues;

export type RefreshResourceMetadataDataAccess = {
  findResourceById: (resourceId: string) => Promise<Resource | null>;
  updateResourceMetadata: (
    resourceId: string,
    values: ResourceRefreshMetadataValues,
  ) => Promise<Resource | null>;
};

type RefreshResourceMetadataForOrganizationOptions = {
  input: RefreshResourceMetadataInput;
  userOrganizationId: string;
  resourceDataAccess: RefreshResourceMetadataDataAccess;
  fetchMetadata?: (url: string) => Promise<ResourcePreviewMetadata>;
  logger?: AppLogger;
};

export const refreshResourceMetadataForOrganization = async ({
  input,
  userOrganizationId,
  resourceDataAccess,
  fetchMetadata = fetchResourcePreviewMetadata,
  logger,
}: RefreshResourceMetadataForOrganizationOptions) => {
  const { resourceId, organizationId } = input;

  if (organizationId !== userOrganizationId) {
    logger?.warn?.(
      "User is not authorized to refresh resources for this organization",
    );

    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "User is not authorized to refresh resources for this organization",
    });
  }

  const resourceToRefresh =
    await resourceDataAccess.findResourceById(resourceId);

  if (!resourceToRefresh) {
    logger?.warn?.("Could not find song resource");

    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Could not find target song resource",
    });
  }

  if (resourceToRefresh.organizationId !== organizationId) {
    logger?.warn?.("Song resource is not associated with organization");

    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Song resource is not associated with this organization",
    });
  }

  const refreshedMetadata = await fetchMetadata(resourceToRefresh.url);

  if (refreshedMetadata.status === "failed") {
    logger?.warn?.("Could not refresh resource preview metadata");

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Could not refresh resource preview metadata",
    });
  }

  try {
    const updatedResource = await resourceDataAccess.updateResourceMetadata(
      resourceId,
      {
        url: refreshedMetadata.normalizedUrl,
        ...toResourceMetadataWriteValues(refreshedMetadata),
      },
    );

    if (!updatedResource) {
      logger?.error?.("Could not refresh resource metadata");

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not refresh resource metadata",
      });
    }

    return updatedResource;
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      logger?.warn?.("URL conflict detected while refreshing metadata");

      throw new TRPCError({
        code: "CONFLICT",
        message: "A resource with this URL already exists for this song",
      });
    }

    throw error;
  }
};
