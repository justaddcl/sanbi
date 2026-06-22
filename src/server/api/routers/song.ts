import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, lte, or, sql } from "drizzle-orm";

import { escapeLikePattern } from "@lib/string/escapeLikePattern";
import { type NewSong } from "@lib/types/db";
import {
  archiveSongSchema,
  deleteSongSchema,
  getSongSchema,
  insertSongSchema,
  searchSongSchema,
  songGetLastPlayInstanceSchema,
  songGetPlayHistorySchema,
  songUpdateFavoriteSchema,
  songUpdateNameSchema,
  songUpdateNotesSchema,
  songUpdatePreferredKeySchema,
  unarchiveSongSchema,
} from "@lib/types/zod";
import {
  adminProcedure,
  createTRPCRouter,
  organizationProcedure,
} from "@server/api/trpc";
import {
  eventTypes,
  sets,
  setSections,
  setSectionSongs,
  setSectionTypes,
  songs,
  songTags,
  tags,
} from "@server/db/schema";

const TRIGRAM_SIMILARITY_THRESHOLD = 0.1;
const TAG_TRIGRAM_SIMILARITY_THRESHOLD = 0.3;
const MIN_FUZZY_TAG_SEARCH_LENGTH = 4;
const DEFAULT_SEARCH_RESULT_LIMIT = 12;

export const songRouter = createTRPCRouter({
  // Queries
  get: organizationProcedure
    .input(getSongSchema)
    .query(async ({ ctx, input }) => {
      console.log(`🤖 - [song/get] - attempting to get song ${input.songId}`);

      const { user } = ctx;

      if (user.membership.organizationId !== input.organizationId) {
        console.error(
          `🤖 - [song/get] - User's organization ID does not match the input organization ID`,
          { user, queryInput: { ...input } },
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Organization ID does not match authenticated user's team ID`,
        });
      }

      const song = await ctx.db.query.songs.findFirst({
        where: eq(songs.id, input.songId),
      });

      if (!song) {
        console.error(`🤖 - [song/get] - Could not find song ${input.songId}`, {
          queryInput: { ...input },
        });

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find song",
        });
      }

      if (song.organizationId !== user.membership.organizationId) {
        console.error(
          `🤖 - [song/get] - user ${user.id} is not authorized to get ${song.id}`,
          { song, queryInput: { ...input } },
        );

        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User not authorized to get song",
        });
      }

      console.info(
        `🤖 - [song/get] - successfully retrieved song ${input.songId}`,
        { song },
      );

      return song;
    }),

  search: organizationProcedure
    .input(searchSongSchema)
    .query(async ({ ctx, input }) => {
      console.log(`🤖 - [song/search] - searching for ${input.searchInput}`);

      const normalizedSearchInput = input.searchInput.trim();
      if (!normalizedSearchInput) {
        return [];
      }

      const fuzzySearchInput = `%${escapeLikePattern(normalizedSearchInput)}%`;
      const likeEscapeCharacter = "\\";
      const canFuzzyMatchTags =
        normalizedSearchInput.length >= MIN_FUZZY_TAG_SEARCH_LENGTH;
      const searchResultLimit = input.limit ?? DEFAULT_SEARCH_RESULT_LIMIT;
      const songNameContainsSearchInput = sql`${songs.name} ILIKE ${fuzzySearchInput} ESCAPE ${likeEscapeCharacter}`;
      const songNameSimilarToSearchInput = sql`similarity(${songs.name}, ${normalizedSearchInput}) > ${TRIGRAM_SIMILARITY_THRESHOLD}`;
      const tagContainsSearchInput = sql`${tags.tag} ILIKE ${fuzzySearchInput} ESCAPE ${likeEscapeCharacter}`;
      const tagSimilarToSearchInput = sql`(${canFuzzyMatchTags} AND similarity(${tags.tag}, ${normalizedSearchInput}) > ${TAG_TRIGRAM_SIMILARITY_THRESHOLD})`;
      const tagMatchesSearchInput = sql`(${tagContainsSearchInput} OR ${tagSimilarToSearchInput})`;
      const songHasMatchingTag = sql`EXISTS (
        SELECT 1
        FROM ${songTags} matched_song_tags
        INNER JOIN ${tags} matched_tags ON matched_tags.id = matched_song_tags.tag_id
        WHERE matched_song_tags.song_id = ${songs.id}
          AND matched_tags.organization_id = ${input.organizationId}
          AND (
            matched_tags.tag ILIKE ${fuzzySearchInput} ESCAPE ${likeEscapeCharacter}
            OR (
              ${canFuzzyMatchTags}
              AND similarity(matched_tags.tag, ${normalizedSearchInput}) > ${TAG_TRIGRAM_SIMILARITY_THRESHOLD}
            )
          )
      )`;

      /**
       * NOTE: using similarity requires the pg_trgm extension to be enabled
       * CREATE EXTENSION IF NOT EXISTS pg_trgm;
       */
      const searchResults = await ctx.db
        .select({
          songId: songs.id,
          name: songs.name,
          preferredKey: songs.preferredKey,
          isArchived: songs.isArchived,
          similarityScore: sql<number>`GREATEST(
            similarity(${songs.name}, ${normalizedSearchInput}),
            COALESCE(MAX(similarity(${tags.tag}, ${normalizedSearchInput})), 0)
          )`,
          tags: sql<
            string[]
          >`array_remove(array_agg(DISTINCT ${tags.tag} ORDER BY ${tags.tag}), NULL)`,
          matchedTags: sql<string[]>`COALESCE(
            array_remove(
              array_agg(DISTINCT ${tags.tag} ORDER BY ${tags.tag}) FILTER (WHERE ${tagMatchesSearchInput}),
              NULL
            ),
            ARRAY[]::text[]
          )`,
          lastPlayedDate: sql<Date | null>`
            MAX(
              CASE WHEN ${sets.date} <= NOW()
              THEN ${sets.date}
              END
            )
          `,
        })
        .from(songs)
        .leftJoin(setSectionSongs, eq(setSectionSongs.songId, songs.id))
        .leftJoin(setSections, eq(setSections.id, setSectionSongs.setSectionId))
        .leftJoin(sets, eq(sets.id, setSections.setId))
        .leftJoin(songTags, eq(songTags.songId, songs.id))
        .leftJoin(
          tags,
          and(
            eq(tags.id, songTags.tagId),
            eq(tags.organizationId, input.organizationId),
          ),
        )
        .where(
          and(
            eq(songs.organizationId, input.organizationId),
            or(
              songNameContainsSearchInput,
              songNameSimilarToSearchInput,
              songHasMatchingTag,
            ),
          ),
        )
        .groupBy(songs.id)
        .orderBy(
          desc(sql<number>`GREATEST(
            similarity(${songs.name}, ${normalizedSearchInput}),
            COALESCE(MAX(similarity(${tags.tag}, ${normalizedSearchInput})), 0)
          )`),
          asc(songs.name),
        )
        .limit(searchResultLimit);

      console.log(
        `🤖 - [song/search] - result for ${input.searchInput}:`,
        searchResults,
      );

      return searchResults;
    }),

  // Mutations
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
        favoritedAt: null,
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

  getLastPlayInstance: organizationProcedure
    .input(songGetLastPlayInstanceSchema)
    .query(async ({ ctx, input }) => {
      console.log(
        `🤖 - [song/getLastPlayInstance] - getting last play instance for ${input.songId}`,
      );

      const [lastPlayInstance] = await ctx.db
        .select({
          set: {
            id: sets.id,
            date: sets.date,
            eventTypeId: eventTypes.id,
            eventType: eventTypes.name,
          },
          section: {
            id: setSections.id,
            typeName: setSectionTypes.name,
            typeId: setSectionTypes.id,
            position: setSections.position,
          },
          song: {
            id: setSectionSongs.songId,
            name: songs.name,
            key: setSectionSongs.key,
            position: setSectionSongs.position,
            notes: setSectionSongs.notes,
          },
        })
        .from(setSectionSongs)
        .innerJoin(
          setSections,
          eq(setSectionSongs.setSectionId, setSections.id),
        )
        .innerJoin(sets, eq(setSections.setId, sets.id))
        .innerJoin(
          setSectionTypes,
          eq(setSections.sectionTypeId, setSectionTypes.id),
        )
        .innerJoin(eventTypes, eq(sets.eventTypeId, eventTypes.id))
        .innerJoin(songs, eq(setSectionSongs.songId, songs.id))
        .where(
          and(
            eq(setSectionSongs.songId, input.songId),
            lte(sets.date, new Date().toLocaleDateString("en-CA")), // en-CA is a locale that uses the 'YYYY-MM-DD' format
          ),
        )
        .orderBy(desc(sets.date), desc(setSections.position))
        .limit(1);

      console.log(
        `🤖 - [song/getLastPlayInstance] - last play instance for ${input.songId}`,
        lastPlayInstance,
      );

      return lastPlayInstance;
    }),

  getPlayHistory: organizationProcedure
    .input(songGetPlayHistorySchema)
    .query(async ({ ctx, input }) => {
      console.log(
        `🤖 - [song/getPlayHistory] - getting play history for ${input.songId}`,
      );

      const playHistory = await ctx.db
        .select({
          set: {
            id: sets.id,
            date: sets.date,
            eventTypeId: eventTypes.id,
            eventType: eventTypes.name,
          },
          section: {
            id: setSections.id,
            typeName: setSectionTypes.name,
            typeId: setSectionTypes.id,
            position: setSections.position,
          },
          song: {
            id: setSectionSongs.songId,
            name: songs.name,
            key: setSectionSongs.key,
            position: setSectionSongs.position,
            notes: setSectionSongs.notes,
          },
        })
        .from(setSectionSongs)
        .innerJoin(
          setSections,
          eq(setSectionSongs.setSectionId, setSections.id),
        )
        .innerJoin(sets, eq(setSections.setId, sets.id))
        .innerJoin(
          setSectionTypes,
          eq(setSections.sectionTypeId, setSectionTypes.id),
        )
        .innerJoin(eventTypes, eq(sets.eventTypeId, eventTypes.id))
        .innerJoin(songs, eq(setSectionSongs.songId, songs.id))
        .where(
          and(
            eq(setSectionSongs.songId, input.songId),
            eq(setSectionSongs.organizationId, input.organizationId),
            eq(songs.organizationId, input.organizationId),
          ),
        )
        .orderBy(desc(sets.date), desc(setSections.position));

      console.info(
        `🤖 - [song/getPlayHistory] - found ${playHistory.length} play history items for ${input.songId}`,
      );

      return playHistory;
    }),

  updateName: organizationProcedure
    .input(songUpdateNameSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        `🤖 - [song/updateName] - attempting to update song name for ${input.songId}:`,
        { mutationInput: { ...input } },
      );

      const trimmedName = input.name.trim();

      if (trimmedName === "") {
        console.error(
          `🤖 - [song/updateName] - New song name must not be blank`,
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "New song name must not be blank",
        });
      }

      return await ctx.db.transaction(async (updateTransaction) => {
        const songToUpdate = await updateTransaction.query.songs.findFirst({
          where: eq(songs.id, input.songId),
        });

        if (!songToUpdate) {
          console.error(
            `🤖 - [song/updateName] - could not find song ${input.songId}`,
          );
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Could not find song",
          });
        }

        if (
          songToUpdate.organizationId !== ctx.user.membership.organizationId
        ) {
          console.error(
            `🤖 - [song/updateName] - user ${ctx.user.id} is not authorized to update song ${input.songId}`,
          );
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User is not authorized to update song",
          });
        }

        const [updatedSong] = await updateTransaction
          .update(songs)
          .set({ name: trimmedName })
          .where(eq(songs.id, input.songId))
          .returning();

        return {
          success: true,
          updatedSong,
          mutationInput: { ...input },
        };
      });
    }),

  updateNotes: organizationProcedure
    .input(songUpdateNotesSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: songId } = input;

      console.log(
        `🤖 - [song/updateNotes] - attempting to update song notes for ${songId}:`,
        { mutationInput: { ...input } },
      );

      return await ctx.db.transaction(async (updateTransaction) => {
        const songToUpdate = await updateTransaction.query.songs.findFirst({
          where: eq(songs.id, songId),
        });

        if (!songToUpdate) {
          console.error(
            `🤖 - [song/updateNotes] - could not find song ${songId}`,
          );
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Could not find song",
          });
        }

        if (
          songToUpdate.organizationId !== ctx.user.membership.organizationId
        ) {
          console.error(
            `🤖 - [song/updateNotes] - user ${ctx.user.id} is not authorized to update song ${songId}`,
          );
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User is not authorized to update song",
          });
        }

        const [updatedSong] = await updateTransaction
          .update(songs)
          .set({ notes: input.notes })
          .where(eq(songs.id, songId))
          .returning();

        return {
          success: true,
          updatedSong,
          mutationInput: { ...input },
        };
      });
    }),

  updatePreferredKey: organizationProcedure
    .input(songUpdatePreferredKeySchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        `🤖 - [song/updatePreferredKey] - attempting to update preferred key for ${input.songId}:`,
        { mutationInput: { ...input } },
      );

      return await ctx.db.transaction(async (updateTransaction) => {
        const songToUpdate = await updateTransaction.query.songs.findFirst({
          where: eq(songs.id, input.songId),
        });

        if (!songToUpdate) {
          console.error(
            `🤖 - [song/updatePreferredKey] - could not find song ${input.songId}`,
          );
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Could not find song",
          });
        }

        if (
          songToUpdate.organizationId !== ctx.user.membership.organizationId
        ) {
          console.error(
            `🤖 - [song/updatePreferredKey] - user ${ctx.user.id} is not authorized to update song ${input.songId}`,
          );
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User is not authorized to update song",
          });
        }

        const [updatedSong] = await updateTransaction
          .update(songs)
          .set({ preferredKey: input.preferredKey })
          .where(eq(songs.id, input.songId))
          .returning();

        return {
          success: true,
          updatedSong,
          mutationInput: { ...input },
        };
      });
    }),

  updateFavoriteStatus: organizationProcedure
    .input(songUpdateFavoriteSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        `🤖 - [song/updateFavoriteStatus] - attempting to update favorite status for ${input.songId}:`,
        { mutationInput: { ...input } },
      );

      return await ctx.db.transaction(async (updateTransaction) => {
        const songToUpdate = await updateTransaction.query.songs.findFirst({
          where: eq(songs.id, input.songId),
        });

        if (!songToUpdate) {
          console.error(
            `🤖 - [song/updateFavoriteStatus] - could not find song ${input.songId}`,
          );
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Could not find song",
          });
        }

        if (
          songToUpdate.organizationId !== ctx.user.membership.organizationId
        ) {
          console.error(
            `🤖 - [song/updateFavoriteStatus] - user ${ctx.user.id} is not authorized to update song ${input.songId}`,
          );
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User is not authorized to update song",
          });
        }

        const favoritedAt = input.isFavorite ? new Date() : null;

        const [updatedSong] = await updateTransaction
          .update(songs)
          .set({ favoritedAt })
          .where(eq(songs.id, input.songId))
          .returning();

        return {
          success: true,
          updatedSong,
          mutationInput: { ...input },
        };
      });
    }),
});
