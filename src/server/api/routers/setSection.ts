import { type NewSetSection } from "@lib/types";
import { insertSetSectionSchema } from "@lib/types/zod";
import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";
import { setSections } from "@server/db/schema";

export const setSectionRouter = createTRPCRouter({
  create: organizationProcedure
    .input(insertSetSectionSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("🤖 - [setSectionType/create] - input:", input);

      const { setId, sectionTypeId, position } = input;

      const newSetSection: NewSetSection = {
        setId,
        sectionTypeId,
        position,
      };

      return ctx.db.insert(setSections).values(newSetSection).returning();
    }),
});
