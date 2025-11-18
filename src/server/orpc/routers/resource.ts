import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import * as z from "zod";

import { getRouteLogger } from "@lib/loggers/logger";
import { type NewResource } from "@lib/types";
import { getResourceSchema, insertResourceSchema } from "@lib/types/zod";
import { resources, songs } from "@server/db/schema";
import { organizationProcedure, publicProcedure } from "@server/orpc/base";
import { validateUrl } from "@server/utils/urls/validateUrl";

export const deleteResource = publicProcedure
  .route({
    method: "DELETE",
    path: "/resource/delete",
    summary: "Deletes a song resource",
  })
  .output(z.string())
  .handler(() => {
    return "hi there";
  });

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

export const resourceRouter = {
  delete: deleteResource,
  create: createResource,
};
