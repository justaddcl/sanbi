import { type NewSetSectionType } from "@lib/types";
import { insertSetSectionTypeSchema } from "@lib/types/zod";
import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";
import { setSectionTypes } from "@server/db/schema";

export const setSectionTypeRouter = createTRPCRouter({
  getTypes: organizationProcedure.query(async ({ ctx, input }) => {
    console.log(
      `🤖 - [setSectionType/getTypes] - fetching event types for ${ctx.organization.id}`,
    );

    const setSectionTypes = await ctx.db.query.setSectionTypes.findMany({
      where: (setSectionTypes, { eq }) =>
        eq(setSectionTypes.organizationId, input.organizationId),
      orderBy: (setSectionTypes, { asc }) => [asc(setSectionTypes.name)],
    });

    console.log(
      `🤖 - [setSectionType/getTypes] - set section types for ${ctx.organization.id}`,
      setSectionTypes,
    );

    return setSectionTypes;
  }),

  create: organizationProcedure
    .input(insertSetSectionTypeSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("🤖 - [setSectionType/create] - input:", input);

      const { organizationId, name } = input;

      const newSetSectionType: NewSetSectionType = {
        name,
        organizationId,
      };

      return ctx.db
        .insert(setSectionTypes)
        .values(newSetSectionType)
        .returning();
    }),
});
