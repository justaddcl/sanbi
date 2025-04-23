import { type NewTag } from "@lib/types";
import { createTagSchema, getTagsByOrganizationSchema } from "@lib/types/zod";
import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";
import { songTags, tags } from "@server/db/schema";
import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";

export const tagRouter = createTRPCRouter({
  // Queries
  getByOrganization: organizationProcedure
    .input(getTagsByOrganizationSchema)
    .query(async ({ ctx, input }) => {
      console.log(
        `🤖 - [tag/getByOrganization] - attempting to get song tags for organization ${input.organizationId}`,
      );

      return await ctx.db.transaction(async (queryTransaction) => {
        const organizationTags = await queryTransaction
          .select({
            id: tags.id,
            tag: tags.tag,
            organizationId: tags.organizationId,
            createdAt: tags.createdAt,
            updatedAt: tags.updatedAt,
            // TODO: re-add the usage count if it makes tags better to use
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
