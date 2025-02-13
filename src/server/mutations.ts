"use server";

import { db } from "@server/db";
import { setSectionSongs } from "@server/db/schema";
import { and, eq, sql } from "drizzle-orm";

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
