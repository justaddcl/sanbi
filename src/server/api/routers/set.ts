import {
  adminProcedure,
  createTRPCRouter,
  organizationProcedure,
} from "@server/api/trpc";
import { eventTypes, sets } from "@server/db/schema";
import { type NewSet } from "@lib/types";
import { eq } from "drizzle-orm";
import {
  archiveSetSchema,
  deleteSetSchema,
  getSetSchema,
  insertSetSchema,
  unarchiveSetSchema,
  updateSetDetailsSchema,
  updateSetNotesSchema,
} from "@lib/types/zod";
import { TRPCError } from "@trpc/server";

export const setRouter = createTRPCRouter({
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

      const { setId, date, eventTypeId, organizationId } = input;

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
});
