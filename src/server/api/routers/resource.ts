import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { type NewResource } from "@lib/types";
import { insertResourceSchema } from "@lib/types/zod";
import { resources, songs } from "@server/db/schema";
import { validateUrl } from "@server/utils/urls/validateUrl";

import { createTRPCRouter, organizationProcedure } from "../trpc";

export const resourceRouter = createTRPCRouter({
  /**
   * Mutations
   */
  create: organizationProcedure
    .input(insertResourceSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      console.log("🤖 - [resource/create] ~ attempting to create resource:", {
        user,
        mutationInput: input,
      });

      const { organizationId, songId, url, title } = input;

      if (organizationId !== ctx.user.membership.organizationId) {
        console.error(
          `🤖 - [resource/create] - user ${user.id} is not authorized to create resources for organization ${organizationId}`,
        );
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "User is not authorized to create resources for this organization",
        });
      }

      const songToCreateResourceFor = await ctx.db.query.songs.findFirst({
        where: eq(songs.id, songId),
      });

      if (!songToCreateResourceFor) {
        console.error(`🤖 - [resource/create] - could not find song ${songId}`);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find target song",
        });
      }

      if (songToCreateResourceFor.organizationId !== organizationId) {
        console.error(
          `🤖 - [resource/create] - song ${songId} is not associated with organization ${organizationId}`,
        );
        throw new TRPCError({
          code: "FORBIDDEN",
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

      const [createdResource] = await ctx.db
        .insert(resources)
        .values(newResource)
        .onConflictDoNothing()
        .returning();

      if (!createdResource) {
        console.error(
          `🤖 - [resource/create] - could not create resource ${url} for song ${songId}`,
        );
        throw new TRPCError({
          code: "CONFLICT",
          message: "A resource with this URL already exists for this song",
        });
      }

      console.info(`🤖 - [resource/create] - new resource created`, {
        createdResource,
        mutationInput: input,
      });

      return { success: true, resource: createdResource, mutationInput: input };
    }),
});
