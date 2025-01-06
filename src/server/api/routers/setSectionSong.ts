import { type NewSetSectionSong } from "@lib/types";
import { insertSetSectionSongSchema } from "@lib/types/zod";
import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";
import { setSectionSongs } from "@server/db/schema";
import { TRPCError } from "@trpc/server";

export const setSectionSongRouter = createTRPCRouter({
  create: organizationProcedure
    .input(insertSetSectionSongSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("🤖 - [setSectionSong/create]");

      const { user } = ctx;
      const { organizationId, songId, setSectionId, key, position, notes } =
        input;

      if (organizationId !== user.membership.organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Organization ID does not match authenticated user's team ID`,
        });
      }

      const newSetSectionSong: NewSetSectionSong = {
        songId,
        setSectionId,
        key,
        position,
        notes,
      };

      return ctx.db
        .insert(setSectionSongs)
        .values(newSetSectionSong)
        .returning();
    }),
});
