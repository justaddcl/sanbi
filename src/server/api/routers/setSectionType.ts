import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";

export const setSectionTypeRouter = createTRPCRouter({
  getTypes: organizationProcedure.query(async ({ ctx, input }) => {
    console.log(
      `🤖 - [setSectionType/getSetSectionTypes] - fetching event types for ${ctx.organization.id}`,
    );

    const setSectionTypes = ctx.db.query.setSectionTypes.findMany({
      where: (setSectionTypes, { eq }) =>
        eq(setSectionTypes.organizationId, input.organizationId),
    });

    console.log(
      `🤖 - [setSectionType/getSetSectionTypes] - set section types for ${ctx.organization.id}`,
      setSectionTypes,
    );

    return setSectionTypes;
  }),
});
