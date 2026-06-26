import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";

import { type NewSongTag } from "@lib/types";
import {
  createSongTagSchema,
  deleteSongTagSchema,
  getSongTagsBySongIdSchema,
} from "@lib/types/zod";
import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";
import { songs, songTags, tags } from "@server/db/schema";

export const songTagRouter = createTRPCRouter({
  // Queries
  getBySongId: organizationProcedure
    .input(getSongTagsBySongIdSchema)
    .query(async ({ ctx, input }) => {
      const songToQuery = await ctx.db.query.songs.findFirst({
        where: eq(songs.id, input.songId),
      });

      if (!songToQuery) {
        ctx.logger.error(`could not find song ${input.songId}`);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find song",
        });
      }

      if (songToQuery.organizationId !== ctx.user.membership.organizationId) {
        ctx.logger.error(
          `user ${ctx.user.id} is not authorized to query song ${songToQuery.id}`,
        );
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User is not authorized to query song",
        });
      }

      const songTagsResult = await ctx.db
        .select({
          songId: songTags.songId,
          tagId: songTags.tagId,
          tag: {
            id: tags.id,
            tag: tags.tag,
          },
        })
        .from(songTags)
        .innerJoin(tags, eq(songTags.tagId, tags.id))
        .where(
          and(
            eq(songTags.songId, input.songId),
            eq(tags.organizationId, ctx.user.membership.organizationId),
          ),
        )
        .orderBy(asc(tags.tag));

      ctx.logger.info(
        `found ${songTagsResult.length} tags for song ${input.songId}`,
      );

      return songTagsResult;
    }),

  // Mutations
  create: organizationProcedure
    .input(createSongTagSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info(`attempting to create a new song tag`, {
        mutationInput: input,
      });

      return ctx.db.transaction(async (createMutation) => {
        const songToCreateTagFor = await createMutation.query.songs.findFirst({
          where: eq(songs.id, input.songId),
        });

        if (!songToCreateTagFor) {
          ctx.logger.error(`could not find song ${input.songId}`);
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Could not find target song",
          });
        }

        if (
          songToCreateTagFor.organizationId !==
          ctx.user.membership.organizationId
        ) {
          ctx.logger.error(
            `user ${ctx.user.id} is not authorized to use song ${songToCreateTagFor.id}`,
          );
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User not authorized to use target song to create tag",
          });
        }

        const tagToAttach = await createMutation.query.tags.findFirst({
          where: eq(tags.id, input.tagId),
        });

        if (!tagToAttach) {
          ctx.logger.error(`could not find tag ${input.tagId}`);
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Could not find target tag",
          });
        }

        if (tagToAttach.organizationId !== ctx.user.membership.organizationId) {
          ctx.logger.error(
            `user ${ctx.user.id} is not authorized to use tag ${tagToAttach.id}`,
          );
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User not authorized to use target tag",
          });
        }

        const { songId, tagId } = input;
        const newSongTag: NewSongTag = {
          songId,
          tagId,
        };

        const [songTag] = await createMutation
          .insert(songTags)
          .values(newSongTag)
          .onConflictDoNothing()
          .returning();

        if (!songTag) {
          ctx.logger.error(
            `tag ${input.tagId} already attached to song ${input.songId}`,
          );
          throw new TRPCError({
            code: "CONFLICT",
            message: "Tag is already attached to song",
          });
        }

        ctx.logger.info(`new song tag created`, {
          songTag,
          mutationInput: input,
        });

        return {
          success: true,
          songTag,
          input,
        };
      });
    }),

  delete: organizationProcedure
    .input(deleteSongTagSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info(
        `attempting to delete tag ${input.tagId} from song ${input.songId}`,
        {
          mutationInput: input,
        },
      );

      return ctx.db.transaction(async (deleteMutation) => {
        const songToRemoveTagFrom = await deleteMutation.query.songs.findFirst({
          where: eq(songs.id, input.songId),
        });

        if (!songToRemoveTagFrom) {
          ctx.logger.error(`could not find song ${input.songId}`);
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Could not find target song",
          });
        }

        if (
          songToRemoveTagFrom.organizationId !==
          ctx.user.membership.organizationId
        ) {
          ctx.logger.error(
            `user ${ctx.user.id} is not authorized to modify song ${songToRemoveTagFrom.id}`,
          );
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User not authorized to delete tag from song",
          });
        }

        const [deletedSongTag] = await deleteMutation
          .delete(songTags)
          .where(
            and(
              eq(songTags.songId, input.songId),
              eq(songTags.tagId, input.tagId),
            ),
          )
          .returning();

        if (!deletedSongTag) {
          ctx.logger.error(
            `Tag ${input.tagId} not attached to song ${input.songId} and could not be deleted`,
          );
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tag not found on song",
          });
        }

        ctx.logger.info(`tag removed from song`, {
          deletedSongTag,
          mutationInput: input,
        });

        return {
          success: true,
          deletedSongTag,
          input,
        };
      });
    }),
});
