import {
  authedProcedure,
  createTRPCRouter,
  organizationProcedure,
} from "@server/api/trpc";
import { organizations } from "@server/db/schema";
import { type NewOrganization } from "@/lib/types";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { insertOrganizationSchema } from "@/lib/types/zod";
import { isValidSlug } from "@/lib/string";

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
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (!isValidSlug(input.slug)) {
        console.error(
          `🤖 - URL slug, ${input.slug}, contains invalid characters - organization/create`,
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `URL contains invalid characters`,
          cause: {
            cause: "slug",
          },
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
          code: "CONFLICT",
          message: `Another team is already using this name`,
          cause: {
            cause: "name",
          },
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
          code: "CONFLICT",
          message: `This URL is already taken by another team`,
          cause: {
            cause: "slug",
          },
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
});
