import { auth } from "@clerk/nextjs/server";
import { type LoggerContext } from "@orpc/experimental-pino";
import { ORPCError, os } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import type * as z from "zod";

import {
  type Organization,
  type OrganizationMembershipWithOrganization,
  type User,
} from "@lib/types";
import { type organizationInputSchema } from "@lib/types/zod";
import { db } from "@/server/db";

import { organizationMemberships, organizations, users } from "../db/schema";

export const createORPCContext = async (opts: { headers: HeadersInit }) => {
  return {
    db,
    auth: await auth(),
    headers: new Headers(opts.headers),
  };
};

type BaseContext = Awaited<ReturnType<typeof createORPCContext>> &
  LoggerContext;

const o = os.$context<BaseContext>();

export const publicProcedure = o;

type ClerkAuth = Awaited<ReturnType<typeof auth>>;

type AuthenticatedAuth = ClerkAuth & {
  userId: string;
};

export type AuthedContext = Omit<BaseContext, "auth"> & {
  auth: AuthenticatedAuth;
};

/**
 * Middleware to ensure the user is authenticated.
 */
const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.auth.userId) {
    throw new ORPCError("UNAUTHORIZED");
  }

  const authedContext: AuthedContext = {
    ...context,
    auth: {
      ...context.auth,
      userId: context.auth.userId,
    },
  };

  return next({
    context: authedContext,
  });
});

export type OrganizationContext = {
  user: User & {
    membership: OrganizationMembershipWithOrganization;
  };
  organization: Organization;
};

/**
 * Middleware to ensure the user is a member of the organization specified in the input.
 * This middleware must be used on a procedure that has already applied `authedProcedure`
 * and has an input schema with `organizationId`.
 */
const requireOrganizationMembership = o
  .$context<AuthedContext>() // the user is not null since this is an authed procedure, which would have thrown an "unauthorized" error already
  .middleware(async ({ context, next }, input: unknown) => {
    const organizationInput = input as z.infer<typeof organizationInputSchema>;
    const { organizationId } = organizationInput;

    const user = await context.db.query.users.findFirst({
      where: eq(users.id, context.auth.userId),
    });

    if (!user) {
      throw new ORPCError("NOT_FOUND", {
        message: `Sanbi user, ${context.auth.userId}, not found`,
      });
    }

    const organization = await context.db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
    });

    if (!organization) {
      throw new ORPCError("NOT_FOUND", {
        message: "Organization not found",
      });
    }

    const membership = await context.db.query.organizationMemberships.findFirst(
      {
        where: and(
          eq(organizationMemberships.organizationId, organizationId),
          eq(organizationMemberships.userId, user.id),
        ),
        with: {
          organization: true,
        },
      },
    );

    if (!membership) {
      throw new ORPCError("FORBIDDEN");
    }

    const enrichedContext: AuthedContext & OrganizationContext = {
      ...context,
      user: {
        ...user,
        membership,
      },
      organization: membership.organization,
    };

    return next({
      context: enrichedContext,
    });
  });

/**
 * Middleware to ensure the user has 'admin' permissions in the organization.
 * This must be used on a procedure that has already applied `organizationProcedure`.
 */
const requireAdminPermission = o
  .$context<AuthedContext & OrganizationContext>()
  .middleware(async ({ context, next }) => {
    if (context.user.membership.permissionType !== "admin") {
      throw new ORPCError("FORBIDDEN");
    }

    return next({ context });
  });

export const authedProcedure = publicProcedure.use(requireAuth);

export const organizationProcedure = authedProcedure.use(
  requireOrganizationMembership,
);

export const adminProcedure = organizationProcedure.use(requireAdminPermission);
