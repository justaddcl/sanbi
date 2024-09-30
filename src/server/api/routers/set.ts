import {
  adminProcedure,
  createTRPCRouter,
  organizationProcedure,
} from "@server/api/trpc";
import { sets } from "@server/db/schema";
import { type NewSet } from "@lib/types";
import { eq, sql } from "drizzle-orm";
import {
  archiveSetSchema,
  deleteSetSchema,
  insertSetSchema,
} from "@lib/types/zod";
import { TRPCError } from "@trpc/server";

export const setRouter = createTRPCRouter({
  create: organizationProcedure
    .input(insertSetSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      console.log("🤖 [set/create] ~ authed user:", user);

      const { date, eventTypeId, notes, organizationId } = input;

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
        `🤖 - [set/delete] - attempting to archive set ${input.setId}`,
      );

      const [archivedSet] = await ctx.db
        .update(sets)
        .set({ isArchived: true, updatedAt: sql`NOW()` })
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
