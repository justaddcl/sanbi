import { TRPCError } from "@trpc/server";
import { and, eq, gt, gte, sql } from "drizzle-orm";

import { type NewSetSectionSong } from "@lib/types";
import {
  addAndReorderSongsSchema,
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
import { setSections, setSectionSongs, songs } from "@server/db/schema";
import { moveSongToAdjacentSection, swapSongPosition } from "@server/mutations";

export const setSectionSongRouter = createTRPCRouter({
  create: organizationProcedure
    .input(insertSetSectionSongSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info("input:", input);

      const { user } = ctx;
      const { organizationId, songId, setSectionId, key, position, notes } =
        input;

      if (organizationId !== user.membership.organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Organization ID does not match authenticated user's team ID`,
        });
      }

      return ctx.db.transaction(async (transaction) => {
        await transaction.execute(
          sql`SELECT id FROM ${setSections} WHERE ${setSections.id} = ${setSectionId} FOR UPDATE`,
        );

        const setSection = await transaction.query.setSections.findFirst({
          where: eq(setSections.id, setSectionId),
          columns: {
            organizationId: true,
          },
        });

        if (!setSection) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Set section not found",
          });
        }

        if (setSection.organizationId !== organizationId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized to update this set section",
          });
        }

        await transaction
          .update(setSectionSongs)
          .set({
            position: sql`${setSectionSongs.position} + 1`,
          })
          .where(
            and(
              eq(setSectionSongs.setSectionId, setSectionId),
              gte(setSectionSongs.position, position),
            ),
          );

        const newSetSectionSong: NewSetSectionSong = {
          songId,
          setSectionId,
          key,
          position,
          notes,
          organizationId,
        };

        return transaction
          .insert(setSectionSongs)
          .values(newSetSectionSong)
          .returning();
      });
    }),

  delete: adminProcedure
    .input(deleteSetSectionSongSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      ctx.logger.info("Attempting to delete:", input.setSectionSongId);

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
        const deletedSong = await ctx.db.transaction(async (transaction) => {
          const [deletedSetSectionSong] = await transaction
            .delete(setSectionSongs)
            .where(eq(setSectionSongs.id, input.setSectionSongId))
            .returning();

          if (!deletedSetSectionSong) {
            ctx.logger.error(
              `Could not delete SetSectionSong ID ${input.setSectionSongId}. Aborting song reorder.`,
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
          return deletedSetSectionSong;
        });
        ctx.logger.info(
          `SetSectionSong ID ${deletedSong.id} was successfully deleted`,
        );
        return deletedSong;
      } catch (deleteError) {
        ctx.logger.error(
          `SetSectionSong ID ${input.setSectionSongId} could not be deleted`,
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
      ctx.logger.info(
        `attempting to update ${input.setSectionSongId}'s song to ${input.replacementSongId}:`,
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
          ctx.logger.error(
            `could not find set section song ${input.setSectionSongId}`,
          );

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot find the set section song",
          });
        }

        if (
          setSectionSong.organizationId !== ctx.user.membership.organizationId
        ) {
          ctx.logger.error(
            `User ${ctx.user.id} not authorized to replace song on ${setSectionSong.id}`,
          );

          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized to replace this song",
          });
        }

        const replacementSong = await replaceTransaction.query.songs.findFirst({
          where: eq(songs.id, input.replacementSongId),
        });

        if (!replacementSong) {
          ctx.logger.error(`could not find song ${input.replacementSongId}`);

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot find the replacement song",
          });
        }

        if (replacementSong.organizationId !== setSectionSong.organizationId) {
          ctx.logger.error(
            `Cannot update setSectionSong ${setSectionSong.id} with a song from a different organization: ${replacementSong.id}`,
          );

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot replace with a song from a different organization",
          });
        }

        await replaceTransaction
          .update(setSectionSongs)
          .set({ songId: input.replacementSongId })
          .where(eq(setSectionSongs.id, input.setSectionSongId));

        ctx.logger.info(
          `Successfully updated ${input.setSectionSongId}'s song to ${input.replacementSongId}`,
        );

        return {
          success: true,
          setSectionSong: input.setSectionSongId,
          replacementSong: input.replacementSongId,
        };
      });
    }),

  updateDetails: organizationProcedure
    .input(updateSetSectionSongSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: setSectionSongId, key, ...updates } = input;
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
        ctx.logger.error(`could not find set section song ${setSectionSongId}`);

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot find the set section song",
        });
      }

      if (
        setSectionSong.organizationId !== ctx.user.membership.organizationId
      ) {
        ctx.logger.error(
          `User ${ctx.user.id} not authorized to update set section song ${setSectionSong.id}`,
        );

        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to update this song",
        });
      }

      ctx.logger.info(
        `Attempting to update set section song ${setSectionSongId} with the following updates:`,
        updates,
      );

      const [updatedSong] = await ctx.db
        .update(setSectionSongs)
        .set({
          key,
          ...updates,
        })
        .where(eq(setSectionSongs.id, setSectionSongId))
        .returning();

      ctx.logger.info(
        `Successfully updated details for ${setSectionSongId}:`,
        updatedSong,
      );

      return updatedSong;
    }),

  addAndReorderSongs: organizationProcedure
    .input(addAndReorderSongsSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info(
        `attempting to add a new song and reorder songs in set section ${input.setSectionId}`,
        input,
      );

      const { user } = ctx;
      const { setSectionId, newSong, newSongTempId, orderedSongIds } = input;
      const organizationId = user.membership.organizationId;

      // 1. Verify the setSectionId belongs to the user's organization
      const setSection = await ctx.db.query.setSections.findFirst({
        where: eq(setSections.id, setSectionId),
        columns: {
          id: true,
          organizationId: true,
        },
      });

      if (!setSection) {
        ctx.logger.error(`could not find set section ${setSectionId}`);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Cannot find the set section`,
        });
      }

      if (setSection.organizationId !== organizationId) {
        ctx.logger.error(
          `User ${user.id} not authorized to update set section ${setSectionId}`,
        );
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to update this set section",
        });
      }

      return await ctx.db.transaction(async (transaction) => {
        await transaction.execute(
          sql`SELECT id FROM ${setSections} WHERE ${setSections.id} = ${setSectionId} FOR UPDATE`,
        );

        // 2. Determine the position for the new song from orderedSongIds
        const newSongPosition = orderedSongIds.indexOf(newSongTempId);

        if (newSongPosition === -1) {
          ctx.logger.error(
            `New song's temporary ID ${newSongTempId} not found in the provided ordered list.`,
          );
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "New song's temporary ID not found in ordered list.",
          });
        }

        const newSetSectionSongData: NewSetSectionSong = {
          songId: newSong.songId,
          setSectionId: setSectionId,
          key: newSong.key,
          position: newSongPosition,
          notes: newSong.notes ?? null,
          organizationId: organizationId,
        };

        // 3. Fetch the locked section state, then insert the new song
        const currentSetSectionSongs =
          await transaction.query.setSectionSongs.findMany({
            where: eq(setSectionSongs.setSectionId, setSectionId),
            columns: {
              id: true,
              position: true,
            },
          });
        const [insertedSetSectionSong] = await transaction
          .insert(setSectionSongs)
          .values(newSetSectionSongData)
          .returning();

        if (!insertedSetSectionSong) {
          ctx.logger.error(
            `could not create a new setSectionSong using the input`,
            newSetSectionSongData,
          );

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not create new setSectionSong",
          });
        }

        ctx.logger.info(`Created new setSectionSong`, {
          insertedSetSectionSong,
        });

        ctx.logger.info(
          `Current song positions for set section ${setSectionId}`,
          {
            currentSetSectionSongs,
          },
        );

        // 4. Prepare updates for all songs based on the final desired order
        const currentPositionMap = new Map<string, number>();
        currentSetSectionSongs.forEach((song) => {
          currentPositionMap.set(song.id, song.position);
        });
        currentPositionMap.set(insertedSetSectionSong.id, newSongPosition);

        const requestedOrderedSetSectionSongIds = orderedSongIds.map(
          (songId) =>
            songId === newSongTempId ? insertedSetSectionSong.id : songId,
        );
        const requestedOrderedSetSectionSongIdsSet = new Set(
          requestedOrderedSetSectionSongIds,
        );
        const missingCurrentSetSectionSongIds = currentSetSectionSongs
          .toSorted(
            (firstSong, secondSong) => firstSong.position - secondSong.position,
          )
          .map((song) => song.id)
          .filter(
            (songId) => !requestedOrderedSetSectionSongIdsSet.has(songId),
          );
        const finalOrderedSetSectionSongIds = [
          ...requestedOrderedSetSectionSongIds,
          ...missingCurrentSetSectionSongIds,
        ];

        const updatedSetSectionSongs: { id: string; position: number }[] = [];

        const updatePromises = finalOrderedSetSectionSongIds.reduce<
          Promise<unknown>[]
        >((updatePromises, setSectionSongId, desiredPosition) => {
          const currentPosition = currentPositionMap.get(setSectionSongId);

          if (
            currentPosition === undefined ||
            currentPosition !== desiredPosition
          ) {
            updatedSetSectionSongs.push({
              id: setSectionSongId,
              position: desiredPosition,
            });

            ctx.logger.info(
              `Attempting to update song position affected by adding the new song`,
              {
                setSectionSongId,
                currentPosition,
                desiredPosition,
              },
            );

            updatePromises.push(
              transaction
                .update(setSectionSongs)
                .set({ position: desiredPosition })
                .where(eq(setSectionSongs.id, setSectionSongId))
                .execute(),
            );
          }
          return updatePromises;
        }, []);

        // 5. Execute all position updates in parallel
        await Promise.all(updatePromises);

        ctx.logger.info(
          `Successfully added new setSectionSong ${insertedSetSectionSong.id} and reordered songs for set section ${setSectionId}`,
          { insertedSetSectionSong, updatedSetSectionSongs },
        );

        return {
          success: true,
          newSetSectionSongId: insertedSetSectionSong.id,
        };
      });
    }),
});
