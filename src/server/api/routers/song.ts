import { type NewSong } from "@lib/types/db";
import {
  archiveSongSchema,
  deleteSongSchema,
  insertSongSchema,
  searchSongSchema,
  unarchiveSongSchema,
} from "@lib/types/zod";
import { songs } from "@server/db/schema";
import {
  adminProcedure,
  createTRPCRouter,
  organizationProcedure,
} from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { eq, sql, or, getTableColumns } from "drizzle-orm";

const TRIGRAM_SIMILARITY_THRESHOLD = 0.1;

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
          `🤖 - [song/archive] - Song ID ${archivedSong.id} ("${archivedSong.name}") has been archived`,
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
          `🤖 - [song/unarchive] - Song ID ${unarchivedSong.id} ("${unarchivedSong.name}") has been unarchived`,
        );
      } else {
        console.error(
          `🤖 - [song/unarchive] - Song ID ${input.songId} could not be unarchived`,
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
          `🤖 - [song/delete] - Song ID ${deletedSong.id} ("${deletedSong.name}") was successfully deleted`,
        );
        return deletedSong;
      } else {
        console.error(
          `🤖 - [song/delete] - Song ID ${input.songId} could not be deleted`,
        );
      }
    }),

  search: organizationProcedure
    .input(searchSongSchema)
    .query(async ({ ctx, input }) => {
      console.log(`🤖 - [song/search] - searching for ${input.searchInput}`);

      /**
       * NOTE: using similarity requires the pg_trgm extension to be enabled
       * CREATE EXTENSION IF NOT EXISTS pg_trgm;
       */
      const searchResults = await ctx.db
        .select({
          ...getTableColumns(songs),
          similarityScore: sql<number>`similarity(${songs.name}, ${input.searchInput})`,
        })
        .from(songs)
        .where(
          sql`similarity(${songs.name}, ${input.searchInput}) > ${TRIGRAM_SIMILARITY_THRESHOLD}`,
        );

      console.log(
        `🤖 - [song/search] - result for ${input.searchInput}:`,
        searchResults,
      );

      return searchResults;
    }),
});
