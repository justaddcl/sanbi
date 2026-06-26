import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { logger } from "@lib/loggers/logger";
import {
  type OrganizationMembership,
  type Song,
  type UserWithMemberships,
} from "@lib/types";
import { db } from "@server/db";
import { songs } from "@server/db/schema";

/**
 * Represents a user with at least one active organization membership.
 * Used to ensure operations requiring an active organization context have access
 * to a valid membership.
 */
type UserWithActiveMembership = UserWithMemberships & {
  memberships: [OrganizationMembership, ...OrganizationMembership[]];
};

export const updateSong = async ({
  songId,
  user,
  songUpdates,
}: {
  songId: string;
  user: UserWithActiveMembership;
  songUpdates: Partial<Omit<Song, "id" | "organizationId">>;
}) => {
  const organizationId = user.memberships[0].organizationId;
  const userId = user.id;

  return await db.transaction(async (updateTransaction) => {
    const songToUpdate = await updateTransaction.query.songs.findFirst({
      where: eq(songs.id, songId),
    });

    if (!songToUpdate) {
      logger.error(`🤖 - [song/updateName] - could not find song ${songId}`);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Could not find song",
      });
    }

    if (songToUpdate.organizationId !== organizationId) {
      logger.error(
        `🤖 - [song/update] - user ${userId} from org ${organizationId} is not authorized to update song ${songId} belonging to org ${songToUpdate.organizationId}`,
      );
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User is not authorized to update this song",
      });
    }

    if (Object.keys(songUpdates).length === 0) {
      logger.error(
        `🤖 - [song/update] - No valid fields provided for update on song ${songId}`,
      );
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No valid fields provided for song update",
      });
    }

    const [updatedSong] = await updateTransaction
      .update(songs)
      .set(songUpdates)
      .where(eq(songs.id, songId))
      .returning();

    logger.info(`🤖 - [song/update] - Song ${songId} updated successfully`, {
      songUpdates,
      updatedSong,
    });

    return {
      success: true,
      updatedSong,
      mutationInput: { songId, user, songUpdates },
    };
  });
};
