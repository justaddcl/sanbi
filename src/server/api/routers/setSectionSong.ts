import { type NewSetSectionSong } from "@lib/types";
import {
  deleteSetSectionSongSchema,
  insertSetSectionSongSchema,
  moveSetSectionSongToAdjacentSetSectionSchema,
  swapSetSectionSongSchema,
} from "@lib/types/zod";
import {
  adminProcedure,
  createTRPCRouter,
  organizationProcedure,
} from "@server/api/trpc";
import { setSectionSongs } from "@server/db/schema";
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
});
