import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import * as z from "zod";

import { getRouteLogger } from "@lib/loggers/logger";
import { type NewResource } from "@lib/types";
import {
  deleteResourceSchema,
  getResourceSchema,
  insertResourceSchema,
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
  .output(
    z.object({
      success: z.boolean(),
      resource: getResourceSchema,
      mutationInput: insertResourceSchema,
    }),
  )
  .handler(async ({ context, input }) => {
    const { user } = context;
    console.log("🤖 - [resource/create] ~ attempting to create resource:", {
      user,
      mutationInput: input,
    });

    const { organizationId, songId, url, title } = input;

    if (organizationId !== context.user.membership.organizationId) {
      console.error(
        `🤖 - [resource/create] - user ${user.id} is not authorized to create resources for organization ${organizationId}`,
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
      console.error(`🤖 - [resource/create] - could not find song ${songId}`);
      throw new ORPCError("NOT_FOUND", {
        message: "Could not find target song",
      });
    }

    if (songToCreateResourceFor.organizationId !== organizationId) {
      console.error(
        `🤖 - [resource/create] - song ${songId} is not associated with organization ${organizationId}`,
      );
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
      console.error(
        `🤖 - [resource/create] - could not create resource ${url} for song ${songId}`,
      );
      throw new ORPCError("CONFLICT", {
        message: "A resource with this URL already exists for this song",
      });
    }

    console.info(`🤖 - [resource/create] - new resource created`, {
      createdResource,
      mutationInput: input,
    });

    return { success: true, resource: createdResource, mutationInput: input };
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
      .where(eq(resources.id, input.resourceId))
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
  delete: deleteResource,
};
