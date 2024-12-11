import {
  adminProcedure,
  createTRPCRouter,
  organizationProcedure,
} from "@server/api/trpc";
import { sets } from "@server/db/schema";
import { type NewSet } from "@lib/types";
import { eq } from "drizzle-orm";
import {
  archiveSetSchema,
  deleteSetSchema,
  getSetSchema,
  insertSetSchema,
  unarchiveSetSchema,
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
            with: {
              type: true,
              songs: {
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
});
