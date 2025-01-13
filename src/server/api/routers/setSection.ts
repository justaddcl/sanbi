import { type NewSetSection } from "@lib/types";
import { getSectionsForSet, insertSetSectionSchema } from "@lib/types/zod";
import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";
import { setSections } from "@server/db/schema";
import { eq } from "drizzle-orm";

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

  getSectionsForSet: organizationProcedure
    .input(getSectionsForSet)
    .query(async ({ ctx, input }) => {
      const { setId } = input;
      console.log(
        `🤖 ~ [setSection/getSectionsForSet] ~ attempting to retrieve set sections for ${setId}`,
      );

      const sectionsForSetData = await ctx.db.query.setSections.findMany({
        where: eq(setSections.setId, setId),
        with: {
          type: true,
          songs: {
            with: {
              song: true,
            },
          },
        },
      });

      console.log(
        "🤖 ~ [setSection/getSectionsForSet] ~ sectionsForSetData:",
        sectionsForSetData,
      );

      return sectionsForSetData;
    }),
});
