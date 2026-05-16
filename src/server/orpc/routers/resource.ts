import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";

import { getRouteLogger } from "@lib/loggers/logger";
import { type NewResource } from "@lib/types";
import {
  deleteResourceSchema,
  getResourcesBySongIdSchema,
  getResourceSchema,
  insertResourceSchema,
  updateResourceSchema,
} from "@lib/types/zod";
import { resources, songs } from "@server/db/schema";
import { authedProcedure, organizationProcedure } from "@server/orpc/base";
import { updateResourceForOrganization } from "@server/orpc/services/resource/updateResource";
import { validateUrl } from "@server/utils/urls/validateUrl";

const ROUTER_PREFIX = "/resource";

export const getResourcesBySongId = organizationProcedure
  .route({
    method: "GET",
    path: "/song/{songId}",
    summary: "Gets all resources for a song",
  })
  .input(getResourcesBySongIdSchema)
  .output(getResourceSchema.array())
  .handler(async ({ context, input }) => {
    const { user } = context;

    const logger = getRouteLogger(context, `${ROUTER_PREFIX}/song`, {
      input,
      user,
    });

    logger?.info("Attempting to get resources by song ID");

    const { songId } = input;

    const song = await context.db.query.songs.findFirst({
      where: eq(songs.id, songId),
    });

    if (!song) {
      logger?.warn("Could not find song");

      throw new ORPCError("NOT_FOUND", {
        message: "Could not find target song",
      });
    }

    if (song.organizationId !== context.user.membership.organizationId) {
      logger?.error("Song is not associated with organization");

      throw new ORPCError("FORBIDDEN", {
        message: "Song is not associated with this organization",
      });
    }

    const resourcesForSong = await context.db.query.resources.findMany({
      where: and(
        eq(resources.songId, songId),
        eq(resources.organizationId, context.user.membership.organizationId),
      ),
    });

    logger?.info("Successfully retrieved resources for song");

    return resourcesForSong;
  });

export const createResource = organizationProcedure
  .route({
    method: "POST",
    path: "/create",
    summary: "Creates a new resource for a song",
  })
  .input(insertResourceSchema)
  .output(getResourceSchema)
  .handler(async ({ context, input }) => {
    const { user } = context;

    const logger = getRouteLogger(context, `${ROUTER_PREFIX}/create`, {
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

    logger?.info({ resourceCreated: createdResource }, "New resource created");

    return createdResource;
  });

export const updateResource = organizationProcedure
  .route({
    method: "PATCH",
    path: "/update",
    summary: "Updates a song resource",
  })
  .input(updateResourceSchema)
  .output(getResourceSchema)
  .handler(async ({ context, input }) => {
    const { user } = context;

    const logger = getRouteLogger(context, `${ROUTER_PREFIX}/update`, {
      input,
      user,
    });

    logger?.info("Attempting to update resource");

    return updateResourceForOrganization({
      input,
      userOrganizationId: context.user.membership.organizationId,
      repository: {
        findResourceById: async (resourceId) => {
          const resourceToUpdate = await context.db.query.resources.findFirst({
            where: eq(resources.id, resourceId),
          });

          return resourceToUpdate ?? null;
        },
        updateResource: async (resourceId, values) => {
          const [updatedResource] = await context.db
            .update(resources)
            .set(values)
            .where(eq(resources.id, resourceId))
            .returning();

          return updatedResource ?? null;
        },
      },
      logger,
    });
  });

export const deleteResource = organizationProcedure
  .route({
    method: "DELETE",
    path: "/delete",
    summary: "Deletes a song resource",
  })
  .input(deleteResourceSchema)
  .output(getResourceSchema)
  .handler(async ({ context, input }) => {
    const { db, user } = context;

    const logger = getRouteLogger(context, `${ROUTER_PREFIX}/delete`, {
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

export const resourceRouter = authedProcedure.prefix(ROUTER_PREFIX).router({
  // QUERIES
  getBySongId: getResourcesBySongId,

  // MUTATIONS
  create: createResource,
  update: updateResource,
  delete: deleteResource,
});
