import {
  addAndReorderSongsSchema,
  deleteSetSectionSongSchema,
  insertSetSectionSongSchema,
  moveSetSectionSongToAdjacentSetSectionSchema,
  replaceSetSectionSongSongSchema,
  swapSetSectionSongSchema,
  updateSetSectionSongSchema,
} from "@lib/types/zod";
import {
  adminProcedure,
  createTRPCRouter,
  organizationProcedure,
} from "@server/api/trpc";
import { createSetSectionSongDataAccess } from "@server/services/setSectionSong/setSectionSongDataAccess";
import {
  addAndReorderSongsForOrganization,
  createSetSectionSongForOrganization,
  deleteSetSectionSongForOrganization,
  moveSetSectionSongToAdjacentSectionForOrganization,
  replaceSetSectionSongForOrganization,
  swapSetSectionSongPositionForOrganization,
  updateSetSectionSongDetailsForOrganization,
} from "@server/services/setSectionSong/setSectionSongMutations";

export const setSectionSongRouter = createTRPCRouter({
  create: organizationProcedure
    .input(insertSetSectionSongSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info("input:", input);

      return ctx.db.transaction(async (transaction) => {
        return await createSetSectionSongForOrganization({
          input,
          userOrganizationId: ctx.user.membership.organizationId,
          setSectionSongDataAccess: createSetSectionSongDataAccess(transaction),
          logger: ctx.logger,
        });
      });
    }),

  delete: adminProcedure
    .input(deleteSetSectionSongSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info("Attempting to delete:", input.setSectionSongId);

      const deletedSong = await ctx.db.transaction(async (transaction) => {
        return await deleteSetSectionSongForOrganization({
          setSectionSongId: input.setSectionSongId,
          userOrganizationId: ctx.user.membership.organizationId,
          setSectionSongDataAccess: createSetSectionSongDataAccess(transaction),
          logger: ctx.logger,
        });
      });
      ctx.logger.info(
        `SetSectionSong ID ${deletedSong.id} was successfully deleted`,
      );
      return deletedSong;
    }),

  swapSongWithPrevious: organizationProcedure
    .input(swapSetSectionSongSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (transaction) => {
        return await swapSetSectionSongPositionForOrganization({
          setSectionSongId: input.setSectionSongId,
          direction: "up",
          userOrganizationId: ctx.user.membership.organizationId,
          setSectionSongDataAccess: createSetSectionSongDataAccess(transaction),
          logger: ctx.logger,
        });
      });
    }),

  swapSongWithNext: organizationProcedure
    .input(swapSetSectionSongSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (transaction) => {
        return await swapSetSectionSongPositionForOrganization({
          setSectionSongId: input.setSectionSongId,
          direction: "down",
          userOrganizationId: ctx.user.membership.organizationId,
          setSectionSongDataAccess: createSetSectionSongDataAccess(transaction),
          logger: ctx.logger,
        });
      });
    }),

  moveSongToPreviousSection: organizationProcedure
    .input(moveSetSectionSongToAdjacentSetSectionSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (transaction) => {
        return await moveSetSectionSongToAdjacentSectionForOrganization({
          setSectionSongId: input.setSectionSongId,
          direction: "previous",
          userOrganizationId: ctx.user.membership.organizationId,
          setSectionSongDataAccess: createSetSectionSongDataAccess(transaction),
          logger: ctx.logger,
        });
      });
    }),

  moveSongToNextSection: organizationProcedure
    .input(moveSetSectionSongToAdjacentSetSectionSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (transaction) => {
        return await moveSetSectionSongToAdjacentSectionForOrganization({
          setSectionSongId: input.setSectionSongId,
          direction: "next",
          userOrganizationId: ctx.user.membership.organizationId,
          setSectionSongDataAccess: createSetSectionSongDataAccess(transaction),
          logger: ctx.logger,
        });
      });
    }),

  replaceSong: organizationProcedure
    .input(replaceSetSectionSongSongSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info(
        `attempting to update ${input.setSectionSongId}'s song to ${input.replacementSongId}:`,
      );

      return await ctx.db.transaction(async (replaceTransaction) => {
        return await replaceSetSectionSongForOrganization({
          input,
          userOrganizationId: ctx.user.membership.organizationId,
          setSectionSongDataAccess:
            createSetSectionSongDataAccess(replaceTransaction),
          logger: ctx.logger,
        });
      });
    }),

  updateDetails: organizationProcedure
    .input(updateSetSectionSongSchema)
    .mutation(async ({ ctx, input }) => {
      return await updateSetSectionSongDetailsForOrganization({
        input,
        userOrganizationId: ctx.user.membership.organizationId,
        setSectionSongDataAccess: createSetSectionSongDataAccess(ctx.db),
        logger: ctx.logger,
      });
    }),

  addAndReorderSongs: organizationProcedure
    .input(addAndReorderSongsSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info(
        `attempting to add a new song and reorder songs in set section ${input.setSectionId}`,
        input,
      );

      return await ctx.db.transaction(async (transaction) => {
        return await addAndReorderSongsForOrganization({
          input,
          userOrganizationId: ctx.user.membership.organizationId,
          setSectionSongDataAccess: createSetSectionSongDataAccess(transaction),
          logger: ctx.logger,
        });
      });
    }),
});
