import { type NewTag } from "@lib/types";
import { createTagSchema, getTagsByOrganizationSchema } from "@lib/types/zod";
import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";
import { organizations, songTags, tags } from "@server/db/schema";
import { TRPCError } from "@trpc/server";
import { asc, desc, eq, sql } from "drizzle-orm";

export const tagRouter = createTRPCRouter({
  // Queries
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

  // Mutations
  create: organizationProcedure
    .input(createTagSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(`🤖 - [tag/create] - attempting to create tag`, {
        mutationInput: input,
      });

      if (input.organizationId !== ctx.user.membership.organizationId) {
        console.error(
          `🤖 - [tag/create] - user ${ctx.user.id} is not authorized to create a tag for organization ${input.organizationId}`,
        );
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User is not authorized to create a tag for this team",
        });
      }

      return ctx.db.transaction(async (createTransaction) => {
        const { tag, organizationId } = input;

        const newTag: NewTag = {
          tag,
          organizationId,
        };

        const [createdTag] = await createTransaction
          .insert(tags)
          .values(newTag)
          .onConflictDoNothing()
          .returning();

        if (!createdTag) {
          console.error(
            `🤖 - [tag/create] - tag ${input.tag} already exists for organization ${input.organizationId}`,
          );
          throw new TRPCError({
            code: "CONFLICT",
            message: "Tag already exists",
          });
        }

        console.info(
          `🤖 - [tag/create] - new tag created for organization ${input.organizationId}`,
          {
            createdTag,
          },
        );

        return createdTag;
      });
    }),
});
