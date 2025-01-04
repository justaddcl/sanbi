import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";

export const eventTypeRouter = createTRPCRouter({
  getEventTypes: organizationProcedure.query(async ({ ctx, input }) => {
    console.log(
      `🤖 [eventType/getEventTypes] ~ fetching event types for ${ctx.organization.id}`,
    );

    return ctx.db.query.eventTypes.findMany({
      where: (eventTypes, { eq }) =>
        eq(eventTypes.organizationId, input.organizationId),
    });
  }),
});
