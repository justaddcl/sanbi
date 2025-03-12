import { type NewSetSection } from "@lib/types";
import {
  deleteSetSectionSchema,
  getSectionsForSet,
  insertSetSectionSchema,
  swapSetSectionPositionSchema,
  updateSetSectionType,
} from "@lib/types/zod";
import { updateSetSectionPosition } from "@modules/setSections/api/mutations";
import {
  adminProcedure,
  createTRPCRouter,
  organizationProcedure,
} from "@server/api/trpc";
import { setSections, setSectionTypes } from "@server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq, gt, sql } from "drizzle-orm";

export const setSectionRouter = createTRPCRouter({
  create: organizationProcedure
    .input(insertSetSectionSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("🤖 - [setSectionType/create] - input:", input);

      const { setId, sectionTypeId, position, organizationId } = input;

      const newSetSection: NewSetSection = {
        setId,
        sectionTypeId,
        position,
        organizationId,
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

  swapWithPrevious: organizationProcedure
    .input(swapSetSectionPositionSchema)
    .mutation(async ({ input }) => {
      return await updateSetSectionPosition(input.setSectionId, "up");
    }),

  swapWithNext: organizationProcedure
    .input(swapSetSectionPositionSchema)
    .mutation(async ({ input }) => {
      return await updateSetSectionPosition(input.setSectionId, "down");
    }),

  moveToFirst: organizationProcedure
    .input(swapSetSectionPositionSchema)
    .mutation(async ({ input }) => {
      return await updateSetSectionPosition(input.setSectionId, "first");
    }),

  moveToLast: organizationProcedure
    .input(swapSetSectionPositionSchema)
    .mutation(async ({ input }) => {
      return await updateSetSectionPosition(input.setSectionId, "last");
    }),

  delete: adminProcedure
    .input(deleteSetSectionSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        `🤖 - [setSection/delete] - attempting to delete set section`,
        { ...input },
      );

      try {
        const deletedSetSection = await ctx.db.transaction(
          async (deleteTransaction) => {
            const setSectionToDelete =
              await deleteTransaction.query.setSections.findFirst({
                where: eq(setSections.id, input.setSectionId),
              });

            if (!setSectionToDelete) {
              console.error(
                `🤖 - [setSection/delete] - could not find sets section ${input.setSectionId}`,
              );

              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Cannot find set section",
              });
            }

            if (
              setSectionToDelete.organizationId !==
              ctx.user.membership.organizationId
            ) {
              console.error(
                `🤖 - [setSection/delete] - User ${ctx.user.id} is not authorized to delete set section ${input.setSectionId}`,
              );

              throw new TRPCError({
                code: "FORBIDDEN",
                message: "Not authorized to delete this set section",
              });
            }

            const [deletedSection] = await deleteTransaction
              .delete(setSections)
              .where(eq(setSections.id, input.setSectionId))
              .returning();

            if (!deletedSection) {
              console.error(
                `🤖 - [setSection/delete] - Could not delete set section ${input.setSectionId}. Aborting remaining sections reorder.`,
              );

              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to delete set section",
              });
            }

            await deleteTransaction
              .update(setSections)
              .set({ position: sql`position - 1` })
              .where(
                and(
                  eq(setSections.setId, deletedSection.setId),
                  gt(setSections.position, deletedSection.position),
                ),
              );

            return deletedSection;
          },
        );

        console.info(
          `🤖 - [setSection/delete] - SetSection ID ${deletedSetSection.id} was successfully deleted`,
        );
        return deletedSetSection;
      } catch (deleteError) {
        console.error(
          `🤖 - [setSectionSong/delete] - Could not delete set section ${input.setSectionId}`,
        );

        if (deleteError instanceof TRPCError) {
          throw deleteError;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete set section ${input.setSectionId}`,
        });
      }
    }),
});
