import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";

import { type NewTag } from "@lib/types";
import { createTagSchema, getTagsByOrganizationSchema } from "@lib/types/zod";
import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";
import { tags } from "@server/db/schema";

export const tagRouter = createTRPCRouter({
  // Queries
  getByOrganization: organizationProcedure
    .input(getTagsByOrganizationSchema)
    .query(async ({ ctx, input }) => {
      ctx.logger.info(
        `attempting to get song tags for organization ${input.organizationId}`,
      );

      const organizationTags = await ctx.db
        .select({
          id: tags.id,
          tag: tags.tag,
          organizationId: tags.organizationId,
          createdAt: tags.createdAt,
          updatedAt: tags.updatedAt,
        })
        .from(tags)
        .where(eq(tags.organizationId, input.organizationId))
        .orderBy(asc(tags.tag));

      ctx.logger.info(
        `found ${organizationTags.length} tags for organization ${input.organizationId}`,
      );

      return organizationTags;
    }),

  // Mutations
  create: organizationProcedure
    .input(createTagSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info(`attempting to create tag`, {
        mutationInput: input,
      });

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
          ctx.logger.error(
            `tag ${input.tag} already exists for organization ${input.organizationId}`,
          );
          throw new TRPCError({
            code: "CONFLICT",
            message: "Tag already exists",
          });
        }

        ctx.logger.info(
          `new tag created for organization ${input.organizationId}`,
          {
            createdTag,
          },
        );

        return createdTag;
      });
    }),
});
