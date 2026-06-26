import { and, eq, gt, lt, sql } from "drizzle-orm";

import { logger } from "@lib/loggers/logger";
import { db } from "@server/db";
import { setSections } from "@server/db/schema";
import {
  type SetSectionPositionDataAccess,
  type SwapSetSectionPositionDirection,
  type SwapSetSectionPositionResult,
  updateSetSectionPositionForSet,
} from "@server/services/setSection/updateSetSectionPosition";

export type {
  SwapSetSectionPositionDirection,
  SwapSetSectionPositionResult,
} from "@server/services/setSection/updateSetSectionPosition";

// TODO: add TRPCErrors - especially if the user is not authorized to update set section
export const updateSetSectionPosition = async (
  setSectionToUpdate: string,
  direction: SwapSetSectionPositionDirection,
): Promise<SwapSetSectionPositionResult> => {
  logger.info(
    `🤖 - [setSection/swapWithPrevious/${direction}] - attempting to update set section`,
    { setSectionId: setSectionToUpdate },
  );

  return db.transaction(async (updateTransaction) => {
    const setSectionPositionDataAccess: SetSectionPositionDataAccess = {
      findMaxSetSectionPosition: async (setId) => {
        const [maxSetSectionPositionResult] = await updateTransaction
          .select({ maxSetSectionPosition: sql<number | null>`MAX(position)` })
          .from(setSections)
          .where(eq(setSections.setId, setId));

        return maxSetSectionPositionResult?.maxSetSectionPosition ?? null;
      },
      findSetSectionById: async (setSectionId) => {
        const [setSection] = await updateTransaction
          .select()
          .from(setSections)
          .where(eq(setSections.id, setSectionId))
          .limit(1);

        return setSection ?? null;
      },
      findSetSectionBySetIdAndPosition: async (setId, position) => {
        const [setSection] = await updateTransaction
          .select()
          .from(setSections)
          .where(
            and(
              eq(setSections.setId, setId),
              eq(setSections.position, position),
            ),
          )
          .limit(1);

        return setSection ?? null;
      },
      shiftSetSectionPositions: async (setId, options) => {
        await updateTransaction
          .update(setSections)
          .set({
            position: sql`${setSections.position} + ${options.positionDelta}`,
          })
          .where(
            and(
              eq(setSections.setId, setId),
              options.positionLessThan !== undefined
                ? lt(setSections.position, options.positionLessThan)
                : gt(setSections.position, options.positionGreaterThan),
            ),
          );
      },
      updateSetSectionPosition: async (setSectionId, position) => {
        await updateTransaction
          .update(setSections)
          .set({ position })
          .where(eq(setSections.id, setSectionId));
      },
    };

    return updateSetSectionPositionForSet({
      direction,
      setSectionId: setSectionToUpdate,
      setSectionPositionDataAccess,
    });
  });
};
