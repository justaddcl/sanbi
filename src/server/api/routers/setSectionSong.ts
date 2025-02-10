import { type NewSetSectionSong } from "@lib/types";
import {
  deleteSetSectionSongSchema,
  insertSetSectionSongSchema,
} from "@lib/types/zod";
import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";
import { setSectionSongs } from "@server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

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
  delete: organizationProcedure
    .input(deleteSetSectionSongSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        "🤖 - [setSectionSong/delete] - Attempting to delete:",
        input.setSectionSongId,
      );

      const [deletedSetSectionSong] = await ctx.db
        .delete(setSectionSongs)
        .where(eq(setSectionSongs.id, input.setSectionSongId))
        .returning();

      if (deletedSetSectionSong) {
        console.info(
          `🤖 - [setSectionSong/delete] - SetSectionSong ID ${deletedSetSectionSong.id} was successfully deleted`,
        );
        return deletedSetSectionSong;
      } else {
        console.error(
          `🤖 - [setSectionSong/delete] - SetSectionSong ID ${input.setSectionSongId} could not be deleted`,
        );
      }
    }),
});
