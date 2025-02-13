import { type NewSetSectionSong } from "@lib/types";
import {
  deleteSetSectionSongSchema,
  insertSetSectionSongSchema,
} from "@lib/types/zod";
import {
  adminProcedure,
  createTRPCRouter,
  organizationProcedure,
} from "@server/api/trpc";
import { setSectionSongs } from "@server/db/schema";
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

      const [deletedSetSectionSong] = await ctx.db
        .delete(setSectionSongs)
        .where(eq(setSectionSongs.id, input.setSectionSongId))
        .returning();

      // Update positions of remaining songs
      if (deletedSetSectionSong) {
        await ctx.db
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
      }

      if (deletedSetSectionSong) {
        console.info(
          `🤖 - [setSectionSong/delete] - SetSectionSong ID ${deletedSetSectionSong.id} was successfully deleted`,
        );
        return deletedSetSectionSong;
      } else {
        console.error(
          `🤖 - [setSectionSong/delete] - SetSectionSong ID ${input.setSectionSongId} could not be deleted`,
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete set section song ${input.setSectionSongId}`,
        });
      }
    }),
});
