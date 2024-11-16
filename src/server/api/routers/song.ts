import { type NewSong } from "@/lib/types";
import { insertSongSchema } from "@/lib/types/zod";
import { songs } from "@/server/db/schema";
import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";

export const songRouter = createTRPCRouter({
  create: organizationProcedure
    .input(insertSongSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      console.log("🤖 - [song/create] ~ authed user:", user);

      const {
        name,
        preferredKey,
        notes,
        organizationId,
        isArchived,
        createdBy,
      } = input;

      if (organizationId !== user.membership.organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Organization ID does not match authenticated user's team ID`,
        });
      }

      const newSong: NewSong = {
        name,
        preferredKey,
        organizationId,
        notes,
        isArchived,
        createdBy,
      };

      console.log(`🤖 - [song/create] - new song`, newSong);

      return ctx.db.insert(songs).values(newSong).returning();
    }),
});
