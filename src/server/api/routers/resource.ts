import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import { type NewResource } from "@lib/types";
import {
  deleteResourceSchema,
  getResourcesBySongIdSchema,
  insertResourceSchema,
  previewResourceMetadataSchema,
  refreshResourceMetadataSchema,
  updateResourceSchema,
} from "@lib/types/zod";
import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";
import { resources, songs } from "@server/db/schema";
import { deleteResourceForOrganization } from "@server/services/resource/deleteResource";
import { refreshResourceMetadataForOrganization } from "@server/services/resource/refreshResourceMetadata";
import {
  fetchResourcePreviewMetadata,
  resolveResourceMetadataForUrl,
} from "@server/services/resource/resourceMetadata";
import { updateResourceForOrganization } from "@server/services/resource/updateResource";

export const resourceRouter = createTRPCRouter({
  // QUERIES
  getBySongId: organizationProcedure
    .input(getResourcesBySongIdSchema)
    .query(async ({ ctx, input }) => {
      const { songId } = input;
      const resourceLogger = ctx.logger;

      resourceLogger.info("attempting to get resources", {
        userId: ctx.user.id,
        queryInput: input,
      });

      const song = await ctx.db.query.songs.findFirst({
        where: eq(songs.id, songId),
      });

      if (!song) {
        resourceLogger.error(`could not find song ${songId}`);

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find target song",
        });
      }

      if (song.organizationId !== ctx.user.membership.organizationId) {
        resourceLogger.error(
          `song ${songId} is not associated with organization ${ctx.user.membership.organizationId}`,
        );

        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Song is not associated with this organization",
        });
      }

      const resourcesForSong = await ctx.db.query.resources.findMany({
        where: and(
          eq(resources.songId, songId),
          eq(resources.organizationId, ctx.user.membership.organizationId),
        ),
      });

      resourceLogger.info("successfully retrieved resources", {
        resourcesForSong,
        queryInput: input,
      });

      return resourcesForSong;
    }),

  previewMetadata: organizationProcedure
    .input(previewResourceMetadataSchema)
    .mutation(async ({ ctx, input }) => {
      const resourceLogger = ctx.logger;

      resourceLogger.info("attempting to preview metadata", {
        userId: ctx.user.id,
        mutationInput: input,
      });

      try {
        const previewMetadata = await fetchResourcePreviewMetadata(input.url);

        resourceLogger.info("successfully previewed metadata", {
          previewMetadata,
          mutationInput: input,
        });

        return previewMetadata;
      } catch (error) {
        resourceLogger.error("could not preview metadata", {
          error,
          mutationInput: input,
        });

        throw error;
      }
    }),

  // MUTATIONS
  create: organizationProcedure
    .input(insertResourceSchema)
    .mutation(async ({ ctx, input }) => {
      const { organizationId, songId, url, title } = input;
      const resourceLogger = ctx.logger;

      resourceLogger.info("attempting to create resource", {
        userId: ctx.user.id,
        mutationInput: input,
      });

      const songToCreateResourceFor = await ctx.db.query.songs.findFirst({
        where: eq(songs.id, songId),
      });

      if (!songToCreateResourceFor) {
        resourceLogger.error(`could not find song ${songId}`);

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find target song",
        });
      }

      if (songToCreateResourceFor.organizationId !== organizationId) {
        resourceLogger.error(
          `song ${songId} is not associated with organization ${organizationId}`,
        );

        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Song is not associated with this organization",
        });
      }

      let resolvedMetadata: Awaited<
        ReturnType<typeof resolveResourceMetadataForUrl>
      >;

      try {
        resolvedMetadata = await resolveResourceMetadataForUrl(url);
      } catch (error) {
        resourceLogger.error(`could not resolve metadata for resource ${url}`, {
          error,
          mutationInput: input,
        });

        throw error;
      }

      const newResource: NewResource = {
        songId,
        organizationId,
        url: resolvedMetadata.normalizedUrl,
        title: title ?? null,
        ...resolvedMetadata.metadataValues,
      };

      const [createdResource] = await ctx.db
        .insert(resources)
        .values(newResource)
        .onConflictDoNothing()
        .returning();

      if (!createdResource) {
        resourceLogger.error(
          `could not create resource ${url} for song ${songId}`,
        );

        throw new TRPCError({
          code: "CONFLICT",
          message: "A resource with this URL already exists for this song",
        });
      }

      resourceLogger.info("new resource created", {
        createdResource,
        mutationInput: input,
      });

      return createdResource;
    }),

  update: organizationProcedure
    .input(updateResourceSchema)
    .mutation(async ({ ctx, input }) => {
      const resourceLogger = ctx.logger;

      resourceLogger.info("attempting to update resource", {
        userId: ctx.user.id,
        mutationInput: input,
      });

      try {
        const updatedResource = await updateResourceForOrganization({
          input,
          userOrganizationId: ctx.user.membership.organizationId,
          resourceDataAccess: {
            findResourceById: async (resourceId) => {
              const resourceToUpdate = await ctx.db.query.resources.findFirst({
                where: eq(resources.id, resourceId),
              });

              return resourceToUpdate ?? null;
            },
            updateResource: async (resourceId, values) => {
              const [updatedResource] = await ctx.db
                .update(resources)
                .set(values)
                .where(eq(resources.id, resourceId))
                .returning();

              return updatedResource ?? null;
            },
          },
          logger: resourceLogger,
        });

        resourceLogger.info("resource updated", {
          updatedResource,
          mutationInput: input,
        });

        return updatedResource;
      } catch (error) {
        resourceLogger.error("could not update resource", {
          error,
          mutationInput: input,
        });

        throw error;
      }
    }),

  delete: organizationProcedure
    .input(deleteResourceSchema)
    .mutation(async ({ ctx, input }) => {
      const resourceLogger = ctx.logger;

      resourceLogger.info("attempting to delete resource", {
        userId: ctx.user.id,
        mutationInput: input,
      });

      try {
        const deletedResource = await deleteResourceForOrganization({
          input,
          userOrganizationId: ctx.user.membership.organizationId,
          resourceDataAccess: {
            findResourceById: async (resourceId) => {
              const resourceToDelete = await ctx.db.query.resources.findFirst({
                where: eq(resources.id, resourceId),
              });

              return resourceToDelete ?? null;
            },
            deleteResource: async (resourceId, organizationId) => {
              const [deletedResource] = await ctx.db
                .delete(resources)
                .where(
                  and(
                    eq(resources.id, resourceId),
                    eq(resources.organizationId, organizationId),
                  ),
                )
                .returning();

              return deletedResource ?? null;
            },
          },
          logger: resourceLogger,
        });

        resourceLogger.info("resource deleted", {
          deletedResource,
          mutationInput: input,
        });

        return deletedResource;
      } catch (error) {
        resourceLogger.error("could not delete resource", {
          error,
          mutationInput: input,
        });

        throw error;
      }
    }),

  refreshMetadata: organizationProcedure
    .input(refreshResourceMetadataSchema)
    .mutation(async ({ ctx, input }) => {
      const resourceLogger = ctx.logger;

      resourceLogger.info("attempting to refresh resource metadata", {
        userId: ctx.user.id,
        mutationInput: input,
      });

      try {
        const refreshedResource = await refreshResourceMetadataForOrganization({
          input,
          userOrganizationId: ctx.user.membership.organizationId,
          resourceDataAccess: {
            findResourceById: async (resourceId) => {
              const resourceToRefresh = await ctx.db.query.resources.findFirst({
                where: eq(resources.id, resourceId),
              });

              return resourceToRefresh ?? null;
            },
            updateResourceMetadata: async (resourceId, values) => {
              const [updatedResource] = await ctx.db
                .update(resources)
                .set(values)
                .where(eq(resources.id, resourceId))
                .returning();

              return updatedResource ?? null;
            },
          },
          logger: resourceLogger,
        });

        resourceLogger.info("resource metadata refreshed", {
          refreshedResource,
          mutationInput: input,
        });

        return refreshedResource;
      } catch (error) {
        resourceLogger.error("could not refresh resource metadata", {
          error,
          mutationInput: input,
        });

        throw error;
      }
    }),
});
