"use server";

import { db } from "@server/db";
import { setSections, setSectionSongs } from "@server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq, gt, sql } from "drizzle-orm";

export type SwapSongDirection = "up" | "down";

export type SwapSongsPositionResult = {
  success: boolean;
  message?: string;
};

export const swapSongPosition = async (
  setSectionSongToSwapId: string,
  direction: SwapSongDirection,
): Promise<SwapSongsPositionResult> => {
  return await db.transaction(async (swapTransaction) => {
    const [currentSong] = await swapTransaction
      .select()
      .from(setSectionSongs)
      .where(eq(setSectionSongs.id, setSectionSongToSwapId))
      .limit(1);
    if (!currentSong) {
      console.error(
        `🤖 - [setSectionSongs/swapSongPosition/${direction}] - Song ${setSectionSongToSwapId} not found`,
      );
      return {
        success: false,
        message: `Song not found`,
      };
    }

    const { setSectionId, position } = currentSong;

    const [maxSongPositionResult] = await swapTransaction
      .select({ maxSongPosition: sql<number>`MAX(position)` })
      .from(setSectionSongs)
      .where(eq(setSectionSongs.setSectionId, setSectionId));

    if (
      (direction === "up" && position === 0) ||
      (direction === "down" &&
        position === maxSongPositionResult?.maxSongPosition)
    ) {
      console.error(
        `🤖 - [setSectionSongs/swapSongPosition/${direction}] - Cannot swap song ${direction} from position ${position}`,
      );
      return {
        success: false,
        message: `Cannot move ${direction} from current position`,
      };
    }

    const targetPosition = direction === "up" ? position - 1 : position + 1;

    const [songToSwap] = await swapTransaction
      .select()
      .from(setSectionSongs)
      .where(
        and(
          eq(setSectionSongs.setSectionId, setSectionId),
          eq(setSectionSongs.position, targetPosition),
        ),
      )
      .limit(1);

    if (!songToSwap) {
      console.error(
        `🤖 - [setSectionSongs/swapSongPosition/${direction}] - No song to swap with ${direction}`,
      );
      return {
        success: false,
        message: `No song to swap with ${direction}`,
      };
    }

    console.info(
      `🤖 - [setSectionSongs/swapSongPosition/${direction}] - Preparing to move song ${direction}, swapping with ${songToSwap.id}`,
    );

    await swapTransaction
      .update(setSectionSongs)
      .set({ position: targetPosition })
      .where(eq(setSectionSongs.id, setSectionSongToSwapId));

    await swapTransaction
      .update(setSectionSongs)
      .set({ position })
      .where(eq(setSectionSongs.id, songToSwap.id));

    console.info(
      `🤖 - [setSectionSongs/swapSongPosition/${direction}] - Successfully moved song ${direction}:\n${setSectionSongToSwapId} new position: ${targetPosition}.\n${songToSwap.id} new position: ${position}`,
    );

    return {
      success: true,
      message: `Successfully moved song ${setSectionSongToSwapId} ${direction}`,
    };
  });
};

export type MoveSectionDirection = "previous" | "next";

export const moveSongToAdjacentSection = async (
  setSectionSongId: string,
  direction: MoveSectionDirection,
) => {
  return await db.transaction(async (moveTransaction) => {
    const targetSetSectionSong =
      await moveTransaction.query.setSectionSongs.findFirst({
        where: eq(setSectionSongs.id, setSectionSongId),
        with: {
          setSection: true,
        },
      });

    if (!targetSetSectionSong) {
      console.error(
        `🤖 - [setSectionSongs/moveSongToAdjacentSection/${direction}] - Could not find set section song ${setSectionSongId}`,
      );

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot find set section song",
      });
    }

    // Find the set section to move the song to
    const targetSetSection = await moveTransaction.query.setSections.findFirst({
      where: and(
        eq(setSections.setId, targetSetSectionSong.setSection.setId),
        eq(
          setSections.position,
          targetSetSectionSong.setSection.position +
            (direction === "next" ? 1 : -1),
        ),
      ),
    });

    if (!targetSetSection) {
      console.error(
        `🤖 - [setSectionSongs/moveSongToAdjacentSection/${direction}] - Could not find a set section ${direction} to ${targetSetSectionSong.setSectionId}`,
      );

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Cannot find ${direction} set section`,
      });
    }

    const [highestSongPositionInTargetSection] = await moveTransaction
      .select({ maxPosition: sql<number>`COALESCE(MAX(position), -1)` })
      .from(setSectionSongs)
      .where(eq(setSectionSongs.setSectionId, targetSetSection.id));

    const songPositionAfterMove =
      (highestSongPositionInTargetSection?.maxPosition ?? 0) + 1;

    // Update the songs after the target song's position to fill in the hole
    await moveTransaction
      .update(setSectionSongs)
      .set({ position: sql`position - 1` })
      .where(
        and(
          eq(setSectionSongs.setSectionId, targetSetSectionSong.setSectionId),
          gt(setSectionSongs.position, targetSetSectionSong.position),
        ),
      );

    await moveTransaction
      .update(setSectionSongs)
      .set({
        setSectionId: targetSetSection.id,
        position: songPositionAfterMove,
      })
      .where(eq(setSectionSongs.id, setSectionSongId));

    console.info(
      `🤖 - [setSectionSongs/moveSongToAdjacentSection/${direction}] - Successfully moved ${setSectionSongId} to ${direction} set section, ${targetSetSection.id}, with position ${songPositionAfterMove}`,
    );

    return {
      success: true,
      newSetSectionId: targetSetSection.id,
      newPosition: songPositionAfterMove,
    };
  });
};
