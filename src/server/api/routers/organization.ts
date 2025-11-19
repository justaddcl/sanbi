import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import * as z from "zod";

import {
  authedProcedure,
  createTRPCRouter,
  organizationProcedure,
} from "@server/api/trpc";
import { organizations } from "@server/db/schema";
import { isValidSlug } from "@/lib/string";
import { type NewOrganization } from "@/lib/types";
import {
  deleteOrganizationSchema,
  insertOrganizationSchema,
} from "@/lib/types/zod";

export const organizationRouter = createTRPCRouter({
  organization: organizationProcedure.query(async ({ ctx }) => {
    return ctx.organization;
  }),
  create: authedProcedure
    .input(insertOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("🤖 - Creating a new organization");

      const { userId } = ctx.auth;

      if (!userId) {
        console.log(
          "🤖 - No user is currently signed in - organization/create",
        );
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be signed in to create an organization",
        });
      }

      if (!isValidSlug(input.slug)) {
        console.error(
          `🤖 - URL slug, ${input.slug}, contains invalid characters - organization/create`,
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "URL contains invalid characters",
          // FIXME: will need to migrate to something more like: `cause: { field: "slug" }`
          cause: new z.ZodError([
            {
              code: "invalid_format",
              path: ["slug"],
              message: "URL contains invalid characters",
              format: "url",
            },
          ]),
        });
      }

      // FIXME: the lowercasing of organizations.name should happen from the schema if possible
      const matchingOrganizationName =
        await ctx.db.query.organizations.findFirst({
          where: eq(
            sql`lower(${organizations.name})`,
            input.name.toLowerCase(),
          ),
        });

      if (matchingOrganizationName) {
        console.error(
          `🤖 - Organization name, ${input.name}, already in use - organization/create`,
          matchingOrganizationName,
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Another team is already using this name`,
          // FIXME: will need to migrate to something more like: `cause: { field: "name" }`
          cause: new z.ZodError([
            {
              code: "custom",
              path: ["name"],
              message: "Another team is already using this name",
            },
          ]),
        });
      }

      const matchingOrganizationSlug =
        await ctx.db.query.organizations.findFirst({
          where: eq(
            sql`lower(${organizations.slug})`,
            input.slug.toLowerCase(),
          ),
        });

      if (matchingOrganizationSlug) {
        console.error(
          `🤖 - Organization URL slug, ${input.slug}, already in use - organization/create`,
          matchingOrganizationSlug,
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Another team is already using this URL`,
          // FIXME: will need to migrate to something more like: `cause: { field: "slug" }`
          cause: new z.ZodError([
            {
              code: "custom",
              path: ["slug"],
              message: "Another team is already using this URL",
            },
          ]),
        });
      }

      const newOrganization: NewOrganization = {
        name: input.name,
        slug: input.slug,
      };

      console.log(
        `🤖 - New organization - organization/create`,
        newOrganization,
      );

      return ctx.db
        .insert(organizations)
        .values(newOrganization)
        .onConflictDoNothing()
        .returning();
    }),
  delete: authedProcedure
    .input(deleteOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        `🤖 - [organization/delete] - attempting to delete organization ${input.organizationId}`,
      );

      const [deletedOrganization] = await ctx.db
        .delete(organizations)
        .where(eq(organizations.id, input.organizationId))
        .returning();

      if (deletedOrganization) {
        console.info(
          `🤖 - [organization/delete] - Organization, ${deletedOrganization.name} (ID: ${deletedOrganization.id}), has been deleted`,
        );
      } else {
        console.error(
          `🤖 - [organization/delete] - Organization ID ${input.organizationId} could not be deleted`,
        );
      }
    }),
});
