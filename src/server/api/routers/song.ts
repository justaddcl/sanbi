import { type NewSong } from "@/lib/types";
import {
  archiveSongSchema,
  deleteSongSchema,
  insertSongSchema,
  unarchiveSongSchema,
} from "@/lib/types/zod";
import { songs } from "@/server/db/schema";
import {
  adminProcedure,
  createTRPCRouter,
  organizationProcedure,
} from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const songRouter = createTRPCRouter({
  create: organizationProcedure
    .input(insertSongSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      console.log("🤖 - [song/create] ~ authed user:", user);

      const {
        name,
        preferredKey,
        notes,
        organizationId,
        isArchived,
        createdBy,
      } = input;

      if (organizationId !== user.membership.organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Organization ID does not match authenticated user's team ID`,
        });
      }

      const newSong: NewSong = {
        name,
        preferredKey,
        organizationId,
        notes,
        isArchived,
        createdBy,
      };

      console.log(`🤖 - [song/create] - new song`, newSong);

      return ctx.db.insert(songs).values(newSong).returning();
    }),
  archive: adminProcedure
    .input(archiveSongSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        `🤖 - [song/archive] - attempting to archive song ${input.songId}`,
      );

      const [archivedSong] = await ctx.db
        .update(songs)
        .set({ isArchived: true })
        .where(eq(songs.id, input.songId))
        .returning();

      if (archivedSong) {
        console.info(
          `🤖 - [song/archive] - Song ID ${archivedSong.id} has been archived`,
        );
      } else {
        console.error(
          `🤖 - [song/archive] - Song ID ${input.songId} could not be archived`,
        );
      }
    }),

  unarchive: adminProcedure
    .input(unarchiveSongSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        `🤖 - [song/unarchive] - attempting to to unarchive song ${input.songId}`,
      );

      const [unarchivedSong] = await ctx.db
        .update(songs)
        .set({ isArchived: false })
        .where(eq(songs.id, input.songId))
        .returning();

      if (unarchivedSong) {
        console.info(
          `🤖 - [song/unarchived] - Song ID ${unarchivedSong.id} has been unarchived`,
        );
      } else {
        console.error(
          `🤖 - [song/unarchived] - Song ID ${input.songId} could not be unarchived`,
        );
      }
    }),

  delete: adminProcedure
    .input(deleteSongSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        `🤖 - [song/delete] - attempting to delete song ${input.songId}`,
      );

      const [deletedSong] = await ctx.db
        .delete(songs)
        .where(eq(songs.id, input.songId))
        .returning();

      if (deletedSong) {
        console.info(
          `🤖 - [song/delete] - Song ID ${deletedSong.id} was successfully deleted`,
        );
        return deletedSong;
      } else {
        console.error(
          `🤖 - [song/delete] - Song ID ${input.songId} could not be deleted`,
        );
      }
    }),
});
