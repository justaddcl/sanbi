import {
  authedProcedure,
  createTRPCRouter,
  organizationProcedure,
} from "@server/api/trpc";
import { organizations, sets } from "@server/db/schema";
import { type NewSet } from "@lib/types";
import { eq, sql } from "drizzle-orm";
import { deleteSetSchema, insertSetSchema } from "@lib/types/zod";
import { isValidSlug } from "@lib/string";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

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

  delete: authedProcedure
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
      } else {
        console.error(
          `🤖 - [set/delete] - Set ID ${input.setId} could not be deleted`,
        );
      }
    }),
});
