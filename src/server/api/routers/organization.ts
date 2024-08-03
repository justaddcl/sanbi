import {
  authedProcedure,
  createTRPCRouter,
  organizationProcedure,
} from "@server/api/trpc";
import { organizations } from "@server/db/schema";
import { type NewOrganization } from "@/lib/types";
import { eq, sql } from "drizzle-orm";
import { insertOrganizationSchema } from "@/lib/types/zod";
import { isValidSlug } from "@/lib/string";
import { SanbiError } from "@/lib/types/error";
import { type CreateTeamFormFields } from "@/modules/onboarding/createTeam";
import { type TRPCError } from "@trpc/server";

export class CreateOrganizationError extends SanbiError {
  constructor({
    message,
    code,
    path,
  }: {
    message?: string;
    code: TRPCError["code"];
    path?: keyof Omit<CreateTeamFormFields, "id">;
  }) {
    super({
      message,
      code,
      cause: new Error(path),
    });
  }
}

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
        throw new CreateOrganizationError({ code: "UNAUTHORIZED" });
      }

      if (!isValidSlug(input.slug)) {
        console.error(
          `🤖 - URL slug, ${input.slug}, contains invalid characters - organization/create`,
        );
        throw new CreateOrganizationError({
          code: "BAD_REQUEST",
          message: `URL contains invalid characters`,
          path: "slug",
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
        throw new CreateOrganizationError({
          code: "CONFLICT",
          message: `Another team is already using this name`,
          path: "name",
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
        throw new CreateOrganizationError({
          code: "CONFLICT",
          message: `This URL is already taken by another team`,
          path: "slug",
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
