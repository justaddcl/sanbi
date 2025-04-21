import { type NewSongTag } from "@lib/types";
import {
  createSongTagSchema,
  deleteSongTagSchema,
  getSongTagsBySongIdSchema,
} from "@lib/types/zod";
import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";
import { songs, songTags, tags } from "@server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const songTagRouter = createTRPCRouter({
  // Queries
  getBySongId: organizationProcedure
    .input(getSongTagsBySongIdSchema)
    .query(async ({ ctx, input }) => {
      const songToQuery = await ctx.db.query.songs.findFirst({
        where: eq(songs.id, input.songId),
      });

      if (!songToQuery) {
        console.error(
          `🤖 - [songTag/getBySongId] - could not find song ${input.songId}`,
        );
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find song",
        });
      }

      if (songToQuery.organizationId !== ctx.user.membership.organizationId) {
        console.error(
          `🤖 - [songTag/getBySongId] - user ${ctx.user.id} is not authorized to query song ${songToQuery.id}`,
        );
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User is not authorized to query song",
        });
      }

      const tags = await ctx.db.query.songTags.findMany({
        where: eq(songTags.songId, input.songId),
        columns: {},
        with: {
          tag: {
            columns: {
              id: true,
              tag: true,
            },
          },
        },
      });

      console.info(
        `🤖 - [songTags/getBySongId] - song tags for song ${input.songId}:`,
        tags,
      );

      return tags;
    }),

  // Mutations
  create: organizationProcedure
    .input(createSongTagSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        `🤖 - [songTag/create] - attempting to create a new song tag`,
        {
          mutationInput: input,
        },
      );

      return ctx.db.transaction(async (createMutation) => {
        const songToCreateTagFor = await createMutation.query.songs.findFirst({
          where: eq(songs.id, input.songId),
        });

        if (!songToCreateTagFor) {
          console.error(
            `🤖 - [songTag/create] - could not find song ${input.songId}`,
          );
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Could not find target song",
          });
        }

        if (
          songToCreateTagFor.organizationId !==
          ctx.user.membership.organizationId
        ) {
          console.error(
            `🤖 - [songTag/create] - user ${ctx.user.id} is not authorized to use song ${songToCreateTagFor.id}`,
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
          console.error(
            `🤖 - [songTag/create] - could not find tag ${input.tagId}`,
          );
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Could not find target tag",
          });
        }

        if (tagToAttach.organizationId !== ctx.user.membership.organizationId) {
          console.error(
            `🤖 - [songTag/create] - user ${ctx.user.id} is not authorized to use tag ${tagToAttach.id}`,
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
          console.error(
            `🤖 - [songTag/create] - tag ${input.tagId} already attached to song ${input.songId}`,
          );
          throw new TRPCError({
            code: "CONFLICT",
            message: "Tag is already attached to song",
          });
        }

        console.log(`🤖 - [songTag/create] - new song tag created`, {
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
      console.log(
        `🤖 - [songTag/delete] - attempting to delete tag ${input.tagId} from song ${input.songId}`,
        {
          mutationInput: input,
        },
      );

      return ctx.db.transaction(async (deleteMutation) => {
        const songToRemoveTagFrom = await deleteMutation.query.songs.findFirst({
          where: eq(songs.id, input.songId),
        });

        if (!songToRemoveTagFrom) {
          console.error(
            `🤖 - [songTag/delete] - could not find song ${input.songId}`,
          );
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Could not find target song",
          });
        }

        if (
          songToRemoveTagFrom.organizationId !==
          ctx.user.membership.organizationId
        ) {
          console.error(
            `🤖 - [songTag/delete] - user ${ctx.user.id} is not authorized to modify song ${songToRemoveTagFrom.id}`,
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
          console.error(
            `🤖 - [songTag/delete] - Tag ${input.tagId} not attached to song ${input.songId} and could not be deleted`,
          );
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tag not found on song",
          });
        }

        console.info(`🤖 - [songTag/delete] - tag removed from song`, {
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
