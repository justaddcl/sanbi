import { authedProcedure, createTRPCRouter } from "@server/api/trpc";
import {
  organizationMemberships,
  organizations,
  users,
} from "@server/db/schema";
import { type NewOrganizationMembership } from "@/lib/types";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { insertOrganizationMembershipSchema } from "@/lib/types/zod";
import { z } from "zod";

export const organizationMembershipsRouter = createTRPCRouter({
  create: authedProcedure
    .input(insertOrganizationMembershipSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("🤖 - Creating a new organization membership");
      const { userId } = ctx.auth;

      if (!userId) {
        console.log(
          "🤖 - No user is currently signed in - organization/create",
        );
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const matchingUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      const matchingOrganization = await ctx.db.query.organizations.findFirst({
        where: eq(organizations.id, input.organizationId),
      });

      if (!matchingUser) {
        console.error(
          `🤖 - User ${input.userId} does not exist - organizationMembership/create`,
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User does not exist",
        });
      }

      if (!matchingOrganization) {
        console.error(
          `🤖 - Organization ${input.organizationId} does not exist - organizationMembership/create`,
        );
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
        console.error(
          `🤖 - User ${input.userId} is already a member of ${input.organizationId} - organizationMembership/create`,
        );
        throw new TRPCError({
          code: "CONFLICT",
          message: `Membership already exists`,
        });
      }

      const newOrganizationMembership: NewOrganizationMembership = {
        organizationId: input.organizationId,
        userId: input.userId,
        permissionType: input.permissionType || "member",
      };

      console.log(
        `🤖 - New organization membership - organizationMembership/create`,
        newOrganizationMembership,
      );

      return ctx.db
        .insert(organizationMemberships)
        .values(newOrganizationMembership)
        .onConflictDoNothing()
        .returning();
    }),
  isMemberOfOrganization: authedProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const membership = await ctx.db.query.organizationMemberships.findFirst({
        where: and(
          eq(organizationMemberships.organizationId, input.organizationId),
          eq(organizationMemberships.userId, ctx.user.id), // asserting that the user is not null since this is an authed procedure, which would have thrown an "unauthorized" error already
        ),
        with: {
          organization: true,
        },
      });

      return !!membership;
    }),
});
