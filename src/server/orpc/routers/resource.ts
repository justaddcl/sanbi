import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";

import { getRouteLogger } from "@lib/loggers/logger";
import { sanitizeInput } from "@lib/string";
import { type NewResource, type Resource } from "@lib/types";
import {
  deleteResourceSchema,
  getResourceSchema,
  insertResourceSchema,
  updateResourceSchema,
} from "@lib/types/zod";
import { resources, songs } from "@server/db/schema";
import { organizationProcedure } from "@server/orpc/base";
import { validateUrl } from "@server/utils/urls/validateUrl";

export const createResource = organizationProcedure
  .route({
    method: "POST",
    path: "/resource/create",
    summary: "Creates a new resource for a song",
  })
  .input(insertResourceSchema)
  .output(getResourceSchema)
  .handler(async ({ context, input }) => {
    const { user } = context;

    const logger = getRouteLogger(context, "resource/create", {
      input,
      user,
    });

    logger?.info("Attempting to create resource");

    const { organizationId, songId, url, title } = input;

    if (organizationId !== context.user.membership.organizationId) {
      logger?.warn(
        "User is not authorized to create resources for this organization",
      );

      throw new ORPCError("FORBIDDEN", {
        message:
          "User is not authorized to create resources for this organization",
      });
    }

    const songToCreateResourceFor = await context.db.query.songs.findFirst({
      where: eq(songs.id, songId),
    });

    if (!songToCreateResourceFor) {
      logger?.warn("Could not find song");

      throw new ORPCError("NOT_FOUND", {
        message: "Could not find target song",
      });
    }

    if (songToCreateResourceFor.organizationId !== organizationId) {
      logger?.warn("Song is not associated with organization");

      throw new ORPCError("FORBIDDEN", {
        message: "Song is not associated with this organization",
      });
    }

    const validatedUrl = validateUrl(url);

    const newResource: NewResource = {
      songId,
      organizationId,
      url: validatedUrl,
      title,
    };

    const [createdResource] = await context.db
      .insert(resources)
      .values(newResource)
      .onConflictDoNothing()
      .returning();

    if (!createdResource) {
      logger?.warn("Could not create resource");

      throw new ORPCError("CONFLICT", {
        message: "A resource with this URL already exists for this song",
      });
    }

    logger?.info("New resource created");

    return createdResource;
  });

export const updateResource = organizationProcedure
  .route({
    method: "PATCH",
    path: "/resource/update",
    summary: "Updates a song resource",
  })
  .input(updateResourceSchema)
  .output(getResourceSchema)
  .handler(async ({ context, input }) => {
    const { user } = context;

    const logger = getRouteLogger(context, "resource/update", {
      input,
      user,
    });

    logger?.info("Attempting to update resource");

    const { resourceId, organizationId, url, title } = input;

    if (organizationId !== context.user.membership.organizationId) {
      logger?.warn(
        "User is not authorized to update resources for this organization",
      );

      throw new ORPCError("FORBIDDEN", {
        message:
          "User is not authorized to update resources for this organization",
      });
    }

    const resourceToUpdate = await context.db.query.resources.findFirst({
      where: eq(resources.id, resourceId),
    });

    if (!resourceToUpdate) {
      logger?.warn("Could not find song resource");

      throw new ORPCError("NOT_FOUND", {
        message: "Could not find target song resource",
      });
    }

    if (resourceToUpdate.organizationId !== organizationId) {
      logger?.warn("Song resource is not associated with organization");

      throw new ORPCError("FORBIDDEN", {
        message: "Song resource is not associated with this organization",
      });
    }

    const sanitizedTitle = title ? sanitizeInput(title) : undefined;
    const validatedUrl = url ? validateUrl(url) : undefined;

    if (
      (!title && !url) ||
      (sanitizedTitle === resourceToUpdate.title &&
        validatedUrl === resourceToUpdate.url)
    ) {
      logger?.info("No updates needed");

      return resourceToUpdate;
    }

    const [updatedResource] = await context.db
      .update(resources)
      .set({
        title: sanitizedTitle,
        url: validatedUrl,
      })
      .where(eq(resources.id, resourceId))
      .returning();

    if (!updatedResource) {
      logger?.warn("Could not update resource");

      throw new ORPCError("CONFLICT", {
        message: "A resource with this URL already exists for this song",
      });
    }

    logger?.info("Song resource has been updated!");

    return updatedResource;
  });

export const deleteResource = organizationProcedure
  .route({
    method: "DELETE",
    path: "/resource/delete",
    summary: "Deletes a song resource",
  })
  .input(deleteResourceSchema)
  .output(getResourceSchema)
  .handler(async ({ context, input }) => {
    const { db, user } = context;

    const logger = getRouteLogger(context, "resource/delete", {
      input,
      user,
    });

    logger?.info("Attempting to delete resource");

    const requestedResource = await db.query.resources.findFirst({
      where: eq(resources.id, input.resourceId),
    });

    if (!requestedResource) {
      logger?.warn("Resource not found");

      throw new ORPCError("NOT_FOUND", {
        message: "Resource not found",
      });
    }

    if (user.membership.organizationId !== requestedResource.organizationId) {
      logger?.warn("User is not authorized to delete this resource");

      throw new ORPCError("FORBIDDEN", {
        message: "User is not authorized to delete this resource",
      });
    }

    const [deletedResource] = await db
      .delete(resources)
      .where(
        and(
          eq(resources.id, input.resourceId),
          eq(resources.organizationId, user.membership.organizationId),
        ),
      )
      .returning();

    if (deletedResource) {
      logger?.info("Resource deleted");

      return deletedResource;
    } else {
      logger?.error("Resource could not be deleted");

      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Resource could not be deleted",
      });
    }
  });

export const resourceRouter = {
  create: createResource,
  update: updateResource,
  delete: deleteResource,
};
