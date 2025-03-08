import { type NewSetSection } from "@lib/types";
import {
  getSectionsForSet,
  insertSetSectionSchema,
  updateSetSectionType,
} from "@lib/types/zod";
import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";
import { setSections, setSectionTypes } from "@server/db/schema";
import { TRPCError } from "@trpc/server";
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

  changeType: organizationProcedure
    .input(updateSetSectionType)
    .mutation(async ({ ctx, input }) => {
      const { id, sectionTypeId } = input;

      console.log(
        `🤖 - [setSection/changeType] - attempting to update set section`,
        { id, sectionTypeId },
      );

      return await ctx.db.transaction(async (updateTransaction) => {
        const setSection = await updateTransaction.query.setSections.findFirst({
          where: eq(setSections.id, id),
          with: {
            set: true,
          },
        });

        if (!setSection) {
          console.error(
            `🤖 - [setSection/changeType] - could not find set section ${id}`,
          );

          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cannot find the set section",
          });
        }

        if (
          setSection.set.organizationId !== ctx.user.membership.organizationId
        ) {
          console.error(
            `🤖 - [setSection/changeType] - User ${ctx.user.id} not authorized to update set section ${setSection.id}`,
          );

          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized to update this set section",
          });
        }

        const setSectionType =
          await updateTransaction.query.setSectionTypes.findFirst({
            where: eq(setSectionTypes.id, sectionTypeId),
          });

        if (!setSectionType) {
          console.error(
            `🤖 - [setSection/changeType] - could not find set section type ${sectionTypeId}`,
          );

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot find the set section type",
          });
        }

        await updateTransaction
          .update(setSections)
          .set({ sectionTypeId })
          .where(eq(setSections.id, id));

        console.info(
          `🤖 - [setSection/changeType] - Successfully updated ${id}'s section type to ${sectionTypeId}`,
        );

        return {
          success: true,
          setSection: id,
          sectionType: sectionTypeId,
        };
      });
    }),
});
