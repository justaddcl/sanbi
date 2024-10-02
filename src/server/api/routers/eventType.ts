import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";

export const eventTypeRouter = createTRPCRouter({
  getEventTypes: organizationProcedure.query(async ({ ctx }) => {
    console.log(
      `🤖 [eventType/getEventTypes] ~ fetching event types for ${ctx.organization.id}`,
    );

    // TODO: update this to only find the event types that match the `organization.id` - would have to update db schema
    return ctx.db.query.eventTypes.findMany();
  }),
});
