import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import * as z from "zod";

import { authedProcedure, createTRPCRouter } from "@server/api/trpc";
import {
  organizationMemberships,
  organizations,
  users,
} from "@server/db/schema";
import { type NewOrganizationMembership } from "@/lib/types";
import { insertOrganizationMembershipSchema } from "@/lib/types/zod";

export const organizationMembershipsRouter = createTRPCRouter({
  create: authedProcedure
    .input(insertOrganizationMembershipSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info("Creating a new organization membership");
      const { userId } = ctx.auth;

      if (!userId) {
        ctx.logger.info("No user is currently signed in");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const matchingUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      const matchingOrganization = await ctx.db.query.organizations.findFirst({
        where: eq(organizations.id, input.organizationId),
      });

      if (!matchingUser) {
        ctx.logger.error(`User ${input.userId} does not exist`);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User does not exist",
        });
      }

      if (!matchingOrganization) {
        ctx.logger.error(`Organization ${input.organizationId} does not exist`);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Organization does not exist",
        });
      }

      const matchingMembership =
        await ctx.db.query.organizationMemberships.findFirst({
          where: and(
            eq(organizationMemberships.organizationId, input.organizationId),
            eq(organizationMemberships.userId, input.userId),
          ),
        });

      if (matchingMembership) {
        ctx.logger.error(
          `User ${input.userId} is already a member of ${input.organizationId}`,
        );
        throw new TRPCError({
          code: "CONFLICT",
          message: `Membership already exists`,
        });
      }

      const newOrganizationMembership: NewOrganizationMembership = {
        organizationId: input.organizationId,
        userId: input.userId,
        permissionType: input.permissionType ?? "member",
      };

      ctx.logger.info(`New organization membership`, newOrganizationMembership);

      return ctx.db
        .insert(organizationMemberships)
        .values(newOrganizationMembership)
        .onConflictDoNothing()
        .returning();
    }),
  isMemberOfOrganization: authedProcedure
    .input(
      z.object({
        organizationId: z.uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const membership = await ctx.db.query.organizationMemberships.findFirst({
        where: and(
          eq(organizationMemberships.organizationId, input.organizationId),
          eq(organizationMemberships.userId, ctx.auth.userId),
        ),
        with: {
          organization: true,
        },
      });

      return !!membership;
    }),
  forUser: authedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      ctx.logger.info(`Fetching memberships for ${input.userId}`);
      return await ctx.db.query.organizationMemberships.findFirst({
        where: eq(organizationMemberships.userId, input.userId),
        with: {
          organization: true,
        },
      });
    }),
});
