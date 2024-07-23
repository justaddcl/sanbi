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
    console.log("🤖 - Creating a user based on authed user - createMe");
    const { userId } = ctx.auth;

    if (!userId) {
      console.log("🤖 - No user is currently signed in - createMe");
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const matchingUser = await ctx.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (matchingUser) {
      console.log("🤖 - Matching sanbi user found - createMe", userId);
      throw new TRPCError({
        code: "CONFLICT",
        message: `User ${userId} already exists`,
      });
    }

    const user = await currentUser();

    if (!user) {
      console.log("🤖 - Clerk user not found - createMe", userId);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `User not found`,
      });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      console.log(
        `🤖 - Clerk user ${user.id} does not have primary email address - createMe`,
      );
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User must have a primary email address",
      });
    }

    if (!user.firstName) {
      console.log(
        `🤖 - Clerk user ${user.id} does not have a first name - createMe`,
      );
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User must have a first name",
      });
    }

    if (!user.lastName) {
      console.log(
        `🤖 - Clerk user ${user.id} does not have a last name - createMe`,
      );
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
    console.log(`🤖 - New sanbi user - createMe`, newUser);

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
