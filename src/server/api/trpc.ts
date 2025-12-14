/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { auth } from "@clerk/nextjs/server";
import { toORPCError } from "@orpc/client";
import { type ORPCMeta } from "@orpc/trpc";
import { initTRPC, TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import superjson from "superjson";
import * as z from "zod";

import { db } from "@/server/db";

import { organizationMemberships, organizations, users } from "../db/schema";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    auth: auth(),
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC
  .context<typeof createTRPCContext>()
  .meta<ORPCMeta>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          // FIXME: fix the types and expose the error.cause.field
          // field:
          //   error?.cause && Object.keys(error.cause).includes("field")
          //     ? error.cause.field
          //     : null,
          zodError:
            error.code === "BAD_REQUEST" && error.cause instanceof z.ZodError
              ? // TODO: see if we need to use z.flattenError() instead
                z.treeifyError(error.cause)
              : null,
        },
      };
    },
  });

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

export const authedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;

  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // FIXME: this will always fail if a user signs up and has a Clerk user, but not a Sanbi user
  // const user = await db.query.users.findFirst({
  //   where: eq(users.id, ctx.auth.userId),
  // });

  // if (!user) {
  //   throw new TRPCError({
  //     code: "NOT_FOUND",
  //     message: `Sanbi user, ${ctx.auth.userId}, not found`,
  //   });
  // }

  return opts.next({
    ctx: {
      auth: auth(),
      // user,
    },
  });
});

export const organizationProcedure = authedProcedure
  .input(
    z.object({
      organizationId: z.string().uuid(),
    }),
  )
  .use(async (opts) => {
    const { ctx, input } = opts;

    const user = await db.query.users.findFirst({
      where: eq(users.id, ctx.auth.userId!), // asserting that the user is not null since this is an authed procedure, which would have thrown an "unauthorized" error already
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Sanbi user, ${ctx.auth.userId}, not found`,
      });
    }

    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, input.organizationId),
    });

    if (!organization) {
      console.log(
        `🤖 - organizationProcedure: organization ${input.organizationId} could not be found`,
        { procedureInput: input },
      );

      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found",
      });
    }

    const membership =
      await opts.ctx.db.query.organizationMemberships.findFirst({
        where: and(
          eq(organizationMemberships.organizationId, input.organizationId),
          eq(organizationMemberships.userId, user.id),
        ),
        with: {
          organization: true,
        },
      });

    if (!membership) {
      throw new TRPCError({
        code: "FORBIDDEN",
      });
    }

    return opts.next({
      ctx: {
        user: {
          ...user,
          membership,
        },
        organization: membership.organization,
      },
    });
  });

export const adminProcedure = organizationProcedure.use(async (opts) => {
  const { ctx } = opts;

  const organizationMembership = ctx.user.membership;

  if (organizationMembership.permissionType !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
    });
  }

  return opts.next({
    ctx,
  });
});
