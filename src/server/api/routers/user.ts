import { z } from "zod";

import {
  authedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@server/api/trpc";
import { users } from "@server/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { type NewUser } from "@/lib/types";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  hello: authedProcedure.query(({ ctx }) => {
    return {
      greeting: `Hello ${ctx.auth.userId}`,
    };
  }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.users.findMany();
  }),
  createMe: authedProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx.auth;

    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const matchingUser = await ctx.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (matchingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `User ${userId} already exists`,
      });
    }

    const user = await currentUser();

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `User not found`,
      });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User must have a primary email address",
      });
    }

    if (!user.firstName) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User must have a first name",
      });
    }

    if (!user.lastName) {
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

    return ctx.db
      .insert(users)
      .values(newUser)
      .onConflictDoNothing({ target: users.id })
      .returning();
  }),

  // create: publicProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     // simulate a slow db call
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     await ctx.db.insert(posts).values({
  //       name: input.name,
  //     });
  //   }),

  // getLatest: publicProcedure.query(({ ctx }) => {
  //   return ctx.db.query.posts.findFirst({
  //     orderBy: (posts, { desc }) => [desc(posts.createdAt)],
  //   });
  // }),
});
