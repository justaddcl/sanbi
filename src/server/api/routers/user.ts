import { currentUser } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  authedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@server/api/trpc";
import { userPreferences, users } from "@server/db/schema";
import { type NewUser } from "@/lib/types";

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
  createMe: authedProcedure.mutation(async ({ ctx }) => {
    ctx.logger.info("Creating a user based on authed user");
    const { userId } = ctx.auth;

    if (!userId) {
      ctx.logger.info("No user is currently signed in");
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const matchingUser = await ctx.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (matchingUser) {
      ctx.logger.info("Matching sanbi user found", userId);
      throw new TRPCError({
        code: "CONFLICT",
        message: `User ${userId} already exists`,
      });
    }

    const user = await currentUser();

    if (!user) {
      ctx.logger.info("Clerk user not found", userId);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `User not found`,
      });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      ctx.logger.info(
        `Clerk user ${user.id} does not have primary email address`,
      );
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User must have a primary email address",
      });
    }

    if (!user.firstName) {
      ctx.logger.info(`Clerk user ${user.id} does not have a first name`);
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User must have a first name",
      });
    }

    if (!user.lastName) {
      ctx.logger.info(`Clerk user ${user.id} does not have a last name`);
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User must have a last name",
      });
    }

    const newUser: NewUser = {
      id: userId,
      email: userEmail,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    ctx.logger.info(`New sanbi user`, newUser);

    const createdUsers = await ctx.db
      .insert(users)
      .values(newUser)
      .onConflictDoNothing({ target: users.id })
      .returning();

    await ctx.db
      .insert(userPreferences)
      .values({
        userId,
        confirmResourceDelete: true,
      })
      .onConflictDoNothing({ target: userPreferences.userId });

    return createdUsers;
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
