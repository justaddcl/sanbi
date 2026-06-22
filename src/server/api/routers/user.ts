import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  authedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@server/api/trpc";
import { userPreferences, users } from "@server/db/schema";

export const userRouter = createTRPCRouter({
  hello: authedProcedure.query(({ ctx }) => {
    return {
      greeting: `Hello ${ctx.auth.userId}`,
    };
  }),
  getUser: authedProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
        with: {
          memberships: {
            with: {
              organization: true,
            },
          },
          preferences: true,
        },
      });
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.users.findMany();
  }),
  updateResourceDeleteConfirmationPreference: authedProcedure
    .input(z.object({ confirmResourceDelete: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const [updatedPreference] = await ctx.db
        .insert(userPreferences)
        .values({
          userId: ctx.auth.userId,
          confirmResourceDelete: input.confirmResourceDelete,
        })
        .onConflictDoUpdate({
          target: userPreferences.userId,
          set: {
            confirmResourceDelete: input.confirmResourceDelete,
            updatedAt: new Date(),
          },
        })
        .returning();

      if (!updatedPreference) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Could not upsert preferences for user ${ctx.auth.userId}`,
        });
      }

      return updatedPreference;
    }),
});
