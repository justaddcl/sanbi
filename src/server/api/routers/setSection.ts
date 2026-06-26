import { TRPCError } from "@trpc/server";
import { and, eq, gt, sql } from "drizzle-orm";

import { updateSetSectionPosition } from "@modules/setSections/api/mutations";
import { type NewSetSection } from "@lib/types";
import {
  deleteSetSectionSchema,
  getSectionsForSet,
  getSetSectionSchema,
  insertSetSectionSchema,
  swapSetSectionPositionSchema,
  updateSetSectionType,
} from "@lib/types/zod";
import {
  adminProcedure,
  createTRPCRouter,
  organizationProcedure,
} from "@server/api/trpc";
import { setSections, setSectionTypes } from "@server/db/schema";

export const setSectionRouter = createTRPCRouter({
  create: organizationProcedure
    .input(insertSetSectionSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info("input:", input);

      const { setId, sectionTypeId, position, organizationId } = input;

      const newSetSection: NewSetSection = {
        setId,
        sectionTypeId,
        position,
        organizationId,
      };

      return ctx.db.insert(setSections).values(newSetSection).returning();
    }),

  get: organizationProcedure
    .input(getSetSectionSchema)
    .query(async ({ ctx, input }) => {
      ctx.logger.info(
        `attempting to retrieve set sections for ${input.setSectionId}`,
      );

      const setSection = await ctx.db.query.setSections.findFirst({
        where: eq(setSections.id, input.setSectionId),
        with: {
          type: true,
          songs: {
            with: {
              song: true,
            },
          },
        },
      });

      if (!setSection) {
        ctx.logger.error(
          `could not find set section ${input.setSectionId}`,
          input,
        );

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cannot find the set section",
        });
      }

      if (setSection.organizationId !== input.organizationId) {
        ctx.logger.error(
          `User ${ctx.user.id} not authorized to retrieve set section ${setSection.id}`,
        );

        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to retrieve this set section",
        });
      }

      ctx.logger.info(`retrieved set section`, setSection);

      return setSection;
    }),

  getSectionsForSet: organizationProcedure
    .input(getSectionsForSet)
    .query(async ({ ctx, input }) => {
      const { setId } = input;
      ctx.logger.info(`attempting to retrieve set sections for ${setId}`);

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

      ctx.logger.info("sectionsForSetData:", sectionsForSetData);

      return sectionsForSetData;
    }),

  changeType: organizationProcedure
    .input(updateSetSectionType)
    .mutation(async ({ ctx, input }) => {
      const { id, sectionTypeId } = input;

      ctx.logger.info(`attempting to update set section`, {
        id,
        sectionTypeId,
      });

      return await ctx.db.transaction(async (updateTransaction) => {
        const setSection = await updateTransaction.query.setSections.findFirst({
          where: eq(setSections.id, id),
          with: {
            set: true,
          },
        });

        if (!setSection) {
          ctx.logger.error(`could not find set section ${id}`);

          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cannot find the set section",
          });
        }

        if (
          setSection.set.organizationId !== ctx.user.membership.organizationId
        ) {
          ctx.logger.error(
            `User ${ctx.user.id} not authorized to update set section ${setSection.id}`,
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
          ctx.logger.error(`could not find set section type ${sectionTypeId}`);

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot find the set section type",
          });
        }

        await updateTransaction
          .update(setSections)
          .set({ sectionTypeId })
          .where(eq(setSections.id, id));

        ctx.logger.info(
          `Successfully updated ${id}'s section type to ${sectionTypeId}`,
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
      ctx.logger.info(`attempting to delete set section`, { ...input });

      try {
        const deletedSetSection = await ctx.db.transaction(
          async (deleteTransaction) => {
            const setSectionToDelete =
              await deleteTransaction.query.setSections.findFirst({
                where: eq(setSections.id, input.setSectionId),
              });

            if (!setSectionToDelete) {
              ctx.logger.error(
                `could not find sets section ${input.setSectionId}`,
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
              ctx.logger.error(
                `User ${ctx.user.id} is not authorized to delete set section ${input.setSectionId}`,
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
              ctx.logger.error(
                `Could not delete set section ${input.setSectionId}. Aborting remaining sections reorder.`,
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

        ctx.logger.info(
          `SetSection ID ${deletedSetSection.id} was successfully deleted`,
        );
        return deletedSetSection;
      } catch (deleteError) {
        ctx.logger.error(`Could not delete set section ${input.setSectionId}`);

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
