import { TRPCError } from "@trpc/server";
import { and, asc, eq, gt, gte, inArray, lte, or, sql } from "drizzle-orm";

import { pluralize } from "@lib/string";
import { type NewSet } from "@lib/types";
import {
  archiveSetSchema,
  deleteSetSchema,
  duplicateSetSchema,
  getInfiniteSetsSchema,
  getSetSchema,
  insertSetSchema,
  unarchiveSetSchema,
  updateSetDetailsSchema,
  updateSetNotesSchema,
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
} from "@server/db/schema";

type WhereClause = ReturnType<typeof eq> | ReturnType<typeof and>;
const DATE_LOCALE = "en-CA";

export const setRouter = createTRPCRouter({
  // Queries
  get: organizationProcedure
    .input(getSetSchema)
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      console.log("🤖 - [set/get] ~ authed user:", user);

      const { setId } = input;
      console.log(`🤖 ~ [set/get] ~ attempting to retrieve ${setId}`);

      const setData = await ctx.db.query.sets.findFirst({
        where: eq(sets.id, setId),
        with: {
          eventType: true,
          sections: {
            orderBy: (sections, { asc }) => [asc(sections.position)],
            with: {
              type: true,
              songs: {
                orderBy: (songs, { asc }) => [asc(songs.position)],
                with: {
                  song: true,
                },
              },
            },
          },
        },
      });

      console.log("🤖 ~ [set/get] ~ setData:", setData);

      if (user.membership.organizationId !== setData?.organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Organization ID does not match authenticated user's team ID`,
        });
      }

      // TODO: calculate song count here instead of front-end?

      return setData;
    }),

  getUpcoming: organizationProcedure.query(async ({ ctx, input }) => {
    const { organizationId } = ctx.user.membership;
    console.log(
      `🤖 - [set/getUpcoming] - attempting to get the upcoming sets for ${organizationId}`,
    );

    const upcomingSetsSubquery = ctx.db.$with("next_sets").as(
      ctx.db
        .selectDistinctOn([sets.eventTypeId], {
          eventTypeId: sets.eventTypeId,
          setId: sets.id,
          setDate: sets.date,
        })
        .from(sets)
        .where(
          and(
            eq(sets.organizationId, input.organizationId),
            gte(sets.date, new Date().toLocaleDateString("en-CA")), // en-CA is a locale that uses the 'YYYY-MM-DD' format
          ),
        )
        .orderBy(sets.eventTypeId, sets.date),
    );

    // 2) Consume the CTE: join to get names, count songs, group & order
    const upcomingSets = await ctx.db
      .with(upcomingSetsSubquery)
      .select({
        eventTypeId: upcomingSetsSubquery.eventTypeId,
        setId: upcomingSetsSubquery.setId,
        setDate: upcomingSetsSubquery.setDate,
        eventType: eventTypes.name,
        songCount: sql<number>`COUNT(${setSectionSongs.id})`
          .mapWith(Number)
          .as("songCount"),
        favoritedAt: eventTypes.favoritedAt,
      })
      .from(upcomingSetsSubquery)
      .innerJoin(
        eventTypes,
        eq(eventTypes.id, upcomingSetsSubquery.eventTypeId),
      )
      .leftJoin(setSections, eq(setSections.setId, upcomingSetsSubquery.setId))
      .leftJoin(
        setSectionSongs,
        eq(setSectionSongs.setSectionId, setSections.id),
      )
      .groupBy(
        upcomingSetsSubquery.eventTypeId,
        upcomingSetsSubquery.setId,
        upcomingSetsSubquery.setDate,
        eventTypes.name,
        eventTypes.favoritedAt,
      )
      .orderBy(upcomingSetsSubquery.setDate, eventTypes.name);

    console.log(
      `🤖 - [set/getUpcoming] - ${upcomingSets.length} upcoming ${pluralize(upcomingSets.length, { singular: "set", plural: "sets" })} found for ${input.organizationId}`,
      { queryInput: input, upcomingSets },
    );

    return upcomingSets;
  }),

  getInfinite: organizationProcedure
    .input(getInfiniteSetsSchema)
    .query(async ({ ctx, input }) => {
      console.log(
        `🤖 - [set/getInfinite] - attempting to query sets for organization ${input.organizationId}`,
        { queryInput: input },
      );

      const limit = input.limit ?? 10;

      const validEventTypesIds = input.eventTypeFilters
        ? (
            await ctx.db
              .select({ id: eventTypes.id })
              .from(eventTypes)
              .where(
                and(
                  inArray(eventTypes.id, input.eventTypeFilters),
                  eq(eventTypes.organizationId, input.organizationId),
                ),
              )
          ).map((row) => row.id)
        : [];

      const buildWhereClauses = () => {
        const clauses: WhereClause[] = [];

        // always filter by org
        clauses.push(eq(sets.organizationId, input.organizationId));

        // 1) cursor paging
        if (input.cursor) {
          clauses.push(
            or(
              gt(
                sets.date,
                new Date(input.cursor.date).toLocaleDateString(DATE_LOCALE),
              ),
              and(
                eq(
                  sets.date,
                  new Date(input.cursor.date).toLocaleDateString(DATE_LOCALE),
                ),
                gt(sets.id, input.cursor.id),
              ),
            ),
          );
        }

        // 2) eventType filter
        if (validEventTypesIds.length > 0) {
          clauses.push(inArray(sets.eventTypeId, validEventTypesIds));
        }

        // 3) date‐range filters
        if (input.dateRange) {
          // determine if should match exact date if only one date is given
          if (!input.dateRange.to) {
            clauses.push(
              eq(
                sets.date,
                new Date(input.dateRange.from).toLocaleDateString(DATE_LOCALE),
              ),
            );
          } else {
            // or use a date range
            clauses.push(
              gte(
                sets.date,
                new Date(input.dateRange.from).toLocaleDateString(DATE_LOCALE),
              ),
            );
          }

          if (input.dateRange.to) {
            clauses.push(
              lte(
                sets.date,
                new Date(input.dateRange.to).toLocaleDateString(DATE_LOCALE),
              ),
            );
          }
        } else {
          // 4) default “upcoming” filter when no dateRange is provided
          //    (using en-CA ensures YYYY-MM-DD format)
          const today = new Date().toLocaleDateString(DATE_LOCALE);
          clauses.push(
            gte(sets.date, new Date(today).toLocaleDateString(DATE_LOCALE)),
          );
        }

        return clauses;
      };

      const whereClauses = buildWhereClauses();

      const setsResults = await ctx.db
        .select({
          id: sets.id,
          date: sets.date,
          eventType: eventTypes.name,
          songCount: sql<number>`COUNT(${setSectionSongs.songId})`
            .mapWith(Number)
            .as("songCount"),
        })
        .from(sets)
        .leftJoin(eventTypes, eq(eventTypes.id, sets.eventTypeId))
        .leftJoin(setSections, eq(setSections.setId, sets.id))
        .leftJoin(
          setSectionSongs,
          eq(setSectionSongs.setSectionId, setSections.id),
        )
        .where(and(...whereClauses))
        .groupBy(sets.id, sets.date, eventTypes.name)
        .orderBy(asc(sets.date), asc(sets.eventTypeId))
        .limit(limit + 1);

      const setItems = setsResults.slice(0, limit);
      const setItemForCursor = setsResults.at(limit);
      const nextCursor = setItemForCursor
        ? { date: setItemForCursor.date, id: setItemForCursor.id }
        : undefined;

      console.log(
        `🤖 - [set/getInfinite] - ${setsResults.length} results using cursor id ${input.cursor?.id} and date ${input.cursor?.date ?? new Date().toLocaleDateString(DATE_LOCALE)}`,
        {
          queryInput: input,
          setItems,
          setsResults,
          nextCursor,
        },
      );

      return {
        sets: setItems,
        nextCursor,
      };
    }),

  // Mutations
  create: organizationProcedure
    .input(insertSetSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      console.log("🤖 - [set/create] ~ authed user:", user);

      const { date, eventTypeId, notes, organizationId, isArchived } = input;

      if (organizationId !== user.membership.organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Organization ID does not match authenticated user's team ID`,
        });
      }

      const newSet: NewSet = {
        date,
        eventTypeId,
        organizationId,
        notes,
        isArchived,
      };

      console.log(`🤖 - [set/create] - new set`, newSet);

      return ctx.db
        .insert(sets)
        .values(newSet)
        .onConflictDoNothing()
        .returning();
    }),

  archive: adminProcedure
    .input(archiveSetSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        `🤖 - [set/archive] - attempting to archive set ${input.setId}`,
      );

      const [archivedSet] = await ctx.db
        .update(sets)
        .set({ isArchived: true })
        .where(eq(sets.id, input.setId))
        .returning();

      if (archivedSet) {
        console.info(
          `🤖 - [set/archive] - Set ID ${archivedSet.id} has been archived`,
        );
      } else {
        console.error(
          `🤖 - [set/archive] - Set ID ${input.setId} could not be archived`,
        );
      }
    }),

  unarchive: adminProcedure
    .input(unarchiveSetSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        `🤖 - [set/unarchive] - attempting to to unarchive set ${input.setId}`,
      );

      const [unarchivedSet] = await ctx.db
        .update(sets)
        .set({ isArchived: false })
        .where(eq(sets.id, input.setId))
        .returning();

      if (unarchivedSet) {
        console.info(
          `🤖 - [set/unarchived] - Set ID ${unarchivedSet.id} has been unarchived`,
        );
      } else {
        console.error(
          `🤖 - [set/unarchived] - Set ID ${input.setId} could not be unarchived`,
        );
      }
    }),

  delete: adminProcedure
    .input(deleteSetSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        `🤖 - [set/delete] - attempting to delete set ${input.setId}`,
      );

      const [deletedSet] = await ctx.db
        .delete(sets)
        .where(eq(sets.id, input.setId))
        .returning();

      if (deletedSet) {
        console.info(
          `🤖 - [set/delete] - Set ID ${deletedSet.id} was successfully deleted`,
        );
        return deletedSet;
      } else {
        console.error(
          `🤖 - [set/delete] - Set ID ${input.setId} could not be deleted`,
        );
      }
    }),

  updateDetails: organizationProcedure
    .input(updateSetDetailsSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        `🤖 - [set/updateDetails] - attempting to updates details for set ${input.setId}`,
        { ...input },
      );

      const { setId, date, eventTypeId } = input;

      return await ctx.db.transaction(async (updateTransaction) => {
        const setToUpdate = await updateTransaction.query.sets.findFirst({
          where: eq(sets.id, setId),
        });

        if (!setToUpdate) {
          console.error(
            `🤖 - [set/updateDetails] - could not find set ${setId}`,
          );

          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Could not find set",
          });
        }

        if (setToUpdate.organizationId !== ctx.user.membership.organizationId) {
          console.error(
            `🤖 - [set/updateDetails] - User ${ctx.user.id} not authorized to update set ${setId}`,
          );

          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User is not authorized to update this set",
          });
        }

        const updatedEventType =
          await updateTransaction.query.eventTypes.findFirst({
            where: eq(eventTypes.id, eventTypeId),
          });

        if (!updatedEventType) {
          console.error(
            `🤖 - [set/updateDetails] - could not find event type ${eventTypeId}`,
          );

          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Could not find event type",
          });
        }

        if (
          updatedEventType.organizationId !== ctx.user.membership.organizationId
        ) {
          console.error(
            `🤖 - [set/updateDetails] - User ${ctx.user.id} not authorized to use an event type from a different organization`,
            {
              eventTypeId: updatedEventType.id,
              eventOrganizationId: updatedEventType.organizationId,
            },
          );

          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User is not authorized to use event type",
          });
        }

        await updateTransaction
          .update(sets)
          .set({
            date,
            eventTypeId,
          })
          .where(eq(sets.id, setId));

        console.info(
          `🤖 - [set/updateDetails] - Successfully updated set ${setId}'s details:`,
          { date, eventTypeId },
        );

        return {
          success: true,
          date,
          eventTypeId,
        };
      });
    }),

  updateNotes: organizationProcedure
    .input(updateSetNotesSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        `🤖 - [set/updateNotes] - attempting to updates notes for set ${input.setId}`,
        { ...input },
      );

      const setToUpdate = await ctx.db.query.sets.findFirst({
        where: eq(sets.id, input.setId),
      });

      if (!setToUpdate) {
        console.error(
          `🤖 - [set/updateNotes] - could not find set ${input.setId}`,
        );

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find set",
        });
      }

      if (ctx.user.membership.organizationId !== setToUpdate.organizationId) {
        console.error(
          `🤖 - [set/updateNotes] - User ${ctx.user.id} not authorized to update set ${setToUpdate.id}`,
        );

        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User not authorized to update set",
        });
      }

      await ctx.db
        .update(sets)
        .set({ notes: input.notes === "" ? null : input.notes })
        .where(eq(sets.id, setToUpdate.id));

      console.log(
        `🤖 - [set/updateNotes] - set notes updated for ${input.setId}`,
        { notes: input.notes },
      );
    }),

  duplicate: organizationProcedure
    .input(duplicateSetSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        `🤖 - [set/duplicate] - attempting to duplicate set ${input.setToDuplicateId}`,
        { ...input },
      );

      return await ctx.db.transaction(async (duplicateTransaction) => {
        const setToDuplicate = await duplicateTransaction.query.sets.findFirst({
          where: eq(sets.id, input.setToDuplicateId),
        });

        if (!setToDuplicate) {
          console.error(
            `🤖 - [set/duplicate] - could not find target set ${input.setToDuplicateId}`,
          );

          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Could not find set to duplicate",
          });
        }

        if (
          setToDuplicate.organizationId !== ctx.user.membership.organizationId
        ) {
          console.error(
            `🤖 - [set/duplicate] - User ${ctx.user.id} not authorized to duplicate set ${input.setToDuplicateId}`,
          );

          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User not authorized to duplicate set",
          });
        }

        const eventType = await duplicateTransaction.query.eventTypes.findFirst(
          { where: eq(eventTypes.id, input.eventTypeId) },
        );

        if (!eventType) {
          console.error(
            `🤖 - [set/duplicate] - could not find event type ${input.eventTypeId}`,
          );

          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Could not find event type",
          });
        }

        if (eventType.organizationId !== ctx.user.membership.organizationId) {
          console.error(
            `🤖 - [set/duplicate] - User ${ctx.user.id} not authorized to use event type ${input.eventTypeId}`,
          );

          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User not authorized to use event type",
          });
        }

        const newSetValues: NewSet = {
          date: input.date,
          eventTypeId: input.eventTypeId,
          organizationId: setToDuplicate.organizationId,
          notes: input.notes,
          isArchived: false,
        };

        const [newSet] = await duplicateTransaction
          .insert(sets)
          .values(newSetValues)
          .returning();

        if (!newSet) {
          console.error(
            `🤖 - [set/duplicate] - Could not create new set with inputs:`,
            { ...input },
          );

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not create new set",
          });
        }

        const originalSetSections =
          await duplicateTransaction.query.setSections.findMany({
            where: eq(setSections.setId, setToDuplicate.id),
          });

        if (!originalSetSections || originalSetSections.length === 0) {
          return {
            success: true,
            newSet,
          };
        }

        const duplicatedSectionValues = originalSetSections.map((section) => ({
          setId: newSet.id,
          position: section.position,
          sectionTypeId: section.sectionTypeId,
          organizationId: section.organizationId,
        }));

        const newSetSections = await duplicateTransaction
          .insert(setSections)
          .values(duplicatedSectionValues)
          .returning();

        if (!newSetSections) {
          console.error(
            `🤖 - [set/duplicate] - Could not duplicate set sections from set ${input.setToDuplicateId}:`,
            { ...duplicatedSectionValues },
          );

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not duplicate the set sections from the target set",
          });
        }

        if (newSetSections.length !== originalSetSections.length) {
          console.error(
            `🤖 - [set/duplicate] - Mismatch between original and new set sections count:`,
            {
              originalSetSectionsCount: originalSetSections.length,
              newSetSectionsCount: newSetSections.length,
              originalSetSections,
              newSetSections,
            },
          );

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Could not duplicate all the set sections from the target set",
          });
        }

        /**
         * Build a mapping from original section id to new section id to know which set section to add the
         * duplicated set section songs to in the next step.
         */
        const sectionIdMapping = new Map<string, string>();
        for (let i = 0; i < originalSetSections.length; i++) {
          const originalSection = originalSetSections[i];
          const newSection = newSetSections[i];
          if (!originalSection || !newSection) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Undefined section encountered at index ${i}.`,
            });
          }
          sectionIdMapping.set(originalSection.id, newSection.id);
        }

        const originalSetSectionIds = originalSetSections.map(
          (section) => section.id,
        );
        const originalSetSectionSongs =
          await duplicateTransaction.query.setSectionSongs.findMany({
            where: inArray(setSectionSongs.setSectionId, originalSetSectionIds),
          });

        if (!originalSetSectionSongs) {
          console.error(
            `🤖 - [set/duplicate] - Could not duplicate set section songs from set ${input.setToDuplicateId}:`,
            { originalSetSectionIds },
          );

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Could not duplicate the set section songs from the target set",
          });
        }

        const duplicatedSetSectionSongsValues = originalSetSectionSongs.map(
          (song) => ({
            songId: song.songId,
            key: song.key,
            position: song.position,
            notes: song.notes,
            setSectionId: sectionIdMapping.get(song.setSectionId)!,
            organizationId: song.organizationId,
          }),
        );

        if (
          !duplicatedSetSectionSongsValues ||
          duplicatedSetSectionSongsValues.length === 0
        ) {
          return {
            success: true,
            newSet,
            newSetSections,
          };
        }

        const newSetSectionSongs = await duplicateTransaction
          .insert(setSectionSongs)
          .values(duplicatedSetSectionSongsValues)
          .returning();

        if (newSetSectionSongs.length !== originalSetSectionSongs.length) {
          console.error(
            `🤖 - [set/duplicate] - Mismatch between original and new set section songs count:`,
            {
              originalSetSectionSongsCount: originalSetSectionSongs.length,
              newSetSectionSongsCount: newSetSectionSongs.length,
              originalSetSectionSongs,
              newSetSectionSongs,
            },
          );

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Could not duplicate all the set section songs from the target set",
          });
        }

        console.info(
          `🤖 - [set/duplicate] - Successfully duplicated set ${input.setToDuplicateId}:`,
          {
            newSet,
            newSetSections,
            newSetSectionSongs,
          },
        );

        return {
          success: true,
          newSet,
          newSetSections,
          newSetSectionSongs,
        };
      });
    }),
});
