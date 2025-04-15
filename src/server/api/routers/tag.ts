import { getTagsByOrganizationSchema } from "@lib/types/zod";
import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";
import { organizations, songTags, tags } from "@server/db/schema";
import { TRPCError } from "@trpc/server";
import { asc, desc, eq, sql } from "drizzle-orm";

export const tagRouter = createTRPCRouter({
  getByOrganization: organizationProcedure
    .input(getTagsByOrganizationSchema)
    .query(async ({ ctx, input }) => {
      console.log(
        `🤖 - [tag/getByOrganization] - attempting to get song tags for organization ${input.organizationId}`,
      );

      return await ctx.db.transaction(async (queryTransaction) => {
        const organization =
          await queryTransaction.query.organizations.findFirst({
            where: eq(organizations.id, input.organizationId),
          });

        if (!organization) {
          console.error(
            `🤖 - [tag/getByOrganization] - could not find organization ${input.organizationId}`,
          );
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Could not find organization",
          });
        }

        if (organization.id !== ctx.user.membership.organizationId) {
          console.error(
            `🤖 - [tag/getByOrganization] - user ${ctx.user.id} is not authorized to query tags for organization ${input.organizationId}`,
          );
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `User is not authorized to query organization's tags`,
          });
        }

        const organizationTags = await queryTransaction
          .select({
            id: tags.id,
            tag: tags.tag,
            organizationId: tags.organizationId,
            createdAt: tags.createdAt,
            updatedAt: tags.updatedAt,
            // count: sql<number>`COUNT(${songTags.tagId})`.as("count"),
          })
          .from(tags)
          .leftJoin(songTags, eq(songTags.tagId, tags.id))
          .where(eq(tags.organizationId, input.organizationId))
          .groupBy(tags.id)
          .orderBy(asc(tags.tag));

        console.info(
          `🤖 - [tag/getByOrganization] - tags for organization ${input.organizationId}`,
          {
            organizationTags,
          },
        );

        return organizationTags;
      });
    }),
});
