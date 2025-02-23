import { type NewSetSectionSong } from "@lib/types";
import {
  deleteSetSectionSongSchema,
  insertSetSectionSongSchema,
  moveSetSectionSongToAdjacentSetSectionSchema,
  replaceSetSectionSongSongSchema,
  swapSetSectionSongSchema,
  updateSetSectionSongSchema,
} from "@lib/types/zod";
import {
  adminProcedure,
  createTRPCRouter,
  organizationProcedure,
} from "@server/api/trpc";
import { setSectionSongs, songs } from "@server/db/schema";
import { moveSongToAdjacentSection, swapSongPosition } from "@server/mutations";
import { TRPCError } from "@trpc/server";
import { and, eq, gt, sql } from "drizzle-orm";

export const setSectionSongRouter = createTRPCRouter({
  create: organizationProcedure
    .input(insertSetSectionSongSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("🤖 - [setSectionSong/create] - input:", input);

      const { user } = ctx;
      const { organizationId, songId, setSectionId, key, position, notes } =
        input;

      if (organizationId !== user.membership.organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Organization ID does not match authenticated user's team ID`,
        });
      }

      const newSetSectionSong: NewSetSectionSong = {
        songId,
        setSectionId,
        key,
        position,
        notes,
        organizationId,
      };

      return ctx.db
        .insert(setSectionSongs)
        .values(newSetSectionSong)
        .returning();
    }),
  delete: adminProcedure
    .input(deleteSetSectionSongSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      console.log(
        "🤖 - [setSectionSong/delete] - Attempting to delete:",
        input.setSectionSongId,
      );

      // Fetch the set section song to validate organization
      const setSectionSong = await ctx.db.query.setSectionSongs.findFirst({
        where: eq(setSectionSongs.id, input.setSectionSongId),
        with: {
          setSection: {
            with: {
              set: true,
            },
          },
        },
      });

      if (!setSectionSong) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Set section song not found",
        });
      }

      if (
        setSectionSong.setSection.set.organizationId !==
        user.membership.organizationId
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to delete this set section song",
        });
      }

      try {
        const [deletedSong] = await ctx.db.transaction(async (transaction) => {
          const [deletedSetSectionSong] = await transaction
            .delete(setSectionSongs)
            .where(eq(setSectionSongs.id, input.setSectionSongId))
            .returning();

          if (!deletedSetSectionSong) {
            console.error(
              `🤖 - [setSectionSong/delete] - Could not delete SetSectionSong ID ${input.setSectionSongId}. Aborting song reorder.`,
            );

            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to delete set section song ${input.setSectionSongId}`,
            });
          }
          // Update positions of remaining songs
          await transaction
            .update(setSectionSongs)
            .set({
              position: sql`position - 1`,
            })
            .where(
              and(
                eq(
                  setSectionSongs.setSectionId,
                  deletedSetSectionSong.setSectionId,
                ),
                gt(setSectionSongs.position, deletedSetSectionSong.position),
              ),
            );
          return [deletedSetSectionSong];
        });
        console.info(
          `🤖 - [setSectionSong/delete] - SetSectionSong ID ${deletedSong.id} was successfully deleted`,
        );
        return deletedSong;
      } catch (deleteError) {
        console.error(
          `🤖 - [setSectionSong/delete] - SetSectionSong ID ${input.setSectionSongId} could not be deleted`,
        );

        if (deleteError instanceof TRPCError) {
          throw deleteError;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete set section song ${input.setSectionSongId}`,
        });
      }
    }),

  swapSongWithPrevious: organizationProcedure
    .input(swapSetSectionSongSchema)
    .mutation(async ({ input }) => {
      return await swapSongPosition(input.setSectionSongId, "up");
    }),

  swapSongWithNext: organizationProcedure
    .input(swapSetSectionSongSchema)
    .mutation(async ({ input }) => {
      return await swapSongPosition(input.setSectionSongId, "down");
    }),

  moveSongToPreviousSection: organizationProcedure
    .input(moveSetSectionSongToAdjacentSetSectionSchema)
    .mutation(async ({ input }) => {
      return await moveSongToAdjacentSection(
        input.setSectionSongId,
        "previous",
      );
    }),

  moveSongToNextSection: organizationProcedure
    .input(moveSetSectionSongToAdjacentSetSectionSchema)
    .mutation(async ({ input }) => {
      return await moveSongToAdjacentSection(input.setSectionSongId, "next");
    }),

  replaceSong: organizationProcedure
    .input(replaceSetSectionSongSongSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        `🤖 - [setSectionSong/replaceSong] - attempting to update ${input.setSectionSongId}'s song to ${input.replacementSong}:`,
      );

      return await ctx.db.transaction(async (replaceTransaction) => {
        const setSectionSong =
          await replaceTransaction.query.setSectionSongs.findFirst({
            where: eq(setSectionSongs.id, input.setSectionSongId),
            with: {
              setSection: {
                with: {
                  set: true,
                },
              },
            },
          });

        if (!setSectionSong) {
          console.error(
            `🤖 - [setSectionSong/replaceSong] - could not find set section song ${input.setSectionSongId}`,
          );

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot find the set section song",
          });
        }

        if (
          setSectionSong.organizationId !== ctx.user.membership.organizationId
        ) {
          console.error(
            `🤖 - [setSectionSong/replaceSong] - User ${ctx.user.id} not authorized to replace song on ${setSectionSong.id}`,
          );

          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized to replace this song",
          });
        }

        const replacementSong = await replaceTransaction.query.songs.findFirst({
          where: eq(songs.id, input.replacementSong),
        });

        if (!replacementSong) {
          console.error(
            `🤖 - [setSectionSong/replaceSong] - could not find song ${input.replacementSong}`,
          );

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot find the replacement song",
          });
        }

        if (replacementSong.organizationId !== setSectionSong.organizationId) {
          console.error(
            `🤖 - [setSectionSong/replaceSong] - Cannot update setSectionSong ${setSectionSong.id} with a song from a different organization: ${replacementSong.id}`,
          );

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot replace with a song from a different organization",
          });
        }

        await replaceTransaction
          .update(setSectionSongs)
          .set({ songId: input.replacementSong })
          .where(eq(setSectionSongs.id, input.setSectionSongId));

        console.info(
          `🤖 - [setSectionSong/replaceSong] - Successfully updated ${input.setSectionSongId}'s song to ${input.replacementSong}`,
        );

        return {
          success: true,
          setSectionSong: input.setSectionSongId,
          replacementSong: input.replacementSong,
        };
      });
    }),

  updateDetails: organizationProcedure
    .input(updateSetSectionSongSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: setSectionSongId, ...updates } = input;
      const setSectionSong = await ctx.db.query.setSectionSongs.findFirst({
        where: eq(setSectionSongs.id, setSectionSongId),
        with: {
          setSection: {
            with: {
              set: true,
            },
          },
        },
      });

      if (!setSectionSong) {
        console.error(
          `🤖 - [setSectionSong/updateDetails] - could not find set section song ${setSectionSongId}`,
        );

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot find the set section song",
        });
      }

      if (
        setSectionSong.organizationId !== ctx.user.membership.organizationId
      ) {
        console.error(
          `🤖 - [setSectionSong/updateDetails] - User ${ctx.user.id} not authorized to update set section song ${setSectionSong.id}`,
        );

        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to update this song",
        });
      }

      console.info(
        `🤖 - [setSectionSong/updateDetails] - Attempting to update set section song ${setSectionSongId} with the following updates:`,
        updates,
      );

      const [updatedSong] = await ctx.db
        .update(setSectionSongs)
        .set({ ...updates })
        .where(eq(setSectionSongs.id, setSectionSongId))
        .returning();

      console.info(
        `🤖 - [setSectionSong/updateDetails] - Successfully updated details for ${setSectionSongId}:`,
        updatedSong,
      );

      return updatedSong;
    }),
});
