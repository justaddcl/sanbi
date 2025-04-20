import { type NewSongTag } from "@lib/types";
import { createSongTagSchema } from "@lib/types/zod";
import { createTRPCRouter, organizationProcedure } from "@server/api/trpc";
import { songs, songTags } from "@server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const songTagRouter = createTRPCRouter({
  create: organizationProcedure
    .input(createSongTagSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        `🤖 - [songTag/create] - attempting to create a new song tag`,
        {
          mutationInput: input,
        },
      );

      return ctx.db.transaction(async (createMutation) => {
        const songToCreateTagFor = await createMutation.query.songs.findFirst({
          where: eq(songs.id, input.songId),
        });

        if (!songToCreateTagFor) {
          console.error(
            `🤖 - [songTag/create] - could not find song ${input.songId}`,
          );
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Could not find target song",
          });
        }

        if (
          songToCreateTagFor.organizationId !==
          ctx.user.membership.organizationId
        ) {
          console.error(
            `🤖 - [songTag/create] - user ${ctx.user.id} is not authorized to use song ${songToCreateTagFor.id}`,
          );
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User not authorized to use target song to create tag",
          });
        }

        const { songId, tagId } = input;
        const newSongTag: NewSongTag = {
          songId,
          tagId,
        };

        const [songTag] = await ctx.db
          .insert(songTags)
          .values(newSongTag)
          .onConflictDoNothing()
          .returning();

        console.log(`🤖 - [songTag/create] - new song tag created`, {
          songTag,
          mutationInput: input,
        });

        return {
          success: true,
          songTag,
          input,
        };
      });
    }),
});
