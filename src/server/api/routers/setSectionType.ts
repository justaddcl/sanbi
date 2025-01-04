import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";

export const setSectionTypeRouter = createTRPCRouter({
  getTypes: organizationProcedure.query(async ({ ctx, input }) => {
    console.log(
      `🤖 - [setSectionType/getTypes] - fetching event types for ${ctx.organization.id}`,
    );

    const setSectionTypes = await ctx.db.query.setSectionTypes.findMany({
      where: (setSectionTypes, { eq }) =>
        eq(setSectionTypes.organizationId, input.organizationId),
    });

    console.log(
      `🤖 - [setSectionType/getTypes] - set section types for ${ctx.organization.id}`,
      setSectionTypes,
    );

    return setSectionTypes;
  }),
});
