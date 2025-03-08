import { db } from "@server/db";
import { setSections } from "@server/db/schema";
import { and, eq, lt, gt, sql } from "drizzle-orm";

export type SwapSetSectionPositionDirection = "first" | "up" | "down" | "last";

export type SwapSetSectionPositionResult = {
  success: boolean;
  message?: string;
};

export const updateSetSectionPosition = async (
  setSectionToUpdate: string,
  direction: SwapSetSectionPositionDirection,
): Promise<SwapSetSectionPositionResult> => {
  return db.transaction(async (updateTransaction) => {
    const [setSection] = await updateTransaction
      .select()
      .from(setSections)
      .where(eq(setSections.id, setSectionToUpdate))
      .limit(1);
    if (!setSection) {
      console.error(
        `🤖 - [setSection/updateSetSectionPosition/${direction}] - Set section ${setSectionToUpdate} not found`,
      );
      return {
        success: false,
        message: `Set section not found`,
      };
    }

    const { position } = setSection;

    const [maxSetSectionPositionResult] = await updateTransaction
      .select({ maxSetSectionPosition: sql<number>`MAX(position)` })
      .from(setSections)
      .where(eq(setSections.setId, setSection.setId));

    if (!maxSetSectionPositionResult?.maxSetSectionPosition) {
      console.error(
        `🤖 - [setSection/updateSetSectionPosition/${direction}] - Cannot determine max section position value for set ${setSection.setId}`,
      );
      return {
        success: false,
        message: `Cannot determine max section position for matching set`,
      };
    }

    if (
      (direction === "up" && position === 0) ||
      (direction === "down" &&
        position === maxSetSectionPositionResult?.maxSetSectionPosition)
    ) {
      console.error(
        `🤖 - [setSection/updateSetSectionPosition/${direction}] - Cannot swap set section ${direction} from position ${position}`,
      );
      return {
        success: false,
        message: `Cannot move ${direction} from current position`,
      };
    }

    // const targetPosition = direction === "up" ? position - 1 : position + 1;
    const targetPosition: number = (() => {
      if (direction === "up") {
        return position - 1;
      }

      if (direction === "down") {
        return position + 1;
      }

      if (direction === "last") {
        return maxSetSectionPositionResult.maxSetSectionPosition;
      }

      return 0;
    })();

    const isSwapUpdate = direction === "up" || direction === "down";

    if (isSwapUpdate) {
      const [setSectionToSwap] = await updateTransaction
        .select()
        .from(setSections)
        .where(
          and(
            eq(setSections.setId, setSection.setId),
            eq(setSections.position, targetPosition),
          ),
        )
        .limit(1);

      if (!setSectionToSwap) {
        console.error(
          `🤖 - [setSection/updateSetSectionPosition/${direction}] - No set section to swap with ${direction}`,
        );
        return {
          success: false,
          message: `No set section to swap with ${direction}`,
        };
      }

      console.info(
        `🤖 - [setSection/updateSetSectionPosition/${direction}] - Preparing to move set section ${direction}, swapping with ${setSectionToSwap.id}`,
      );

      await updateTransaction
        .update(setSections)
        .set({ position })
        .where(eq(setSections.id, setSectionToSwap.id));

      await updateTransaction
        .update(setSections)
        .set({ position: targetPosition })
        .where(eq(setSections.id, setSection.id));

      console.info(
        `🤖 - [setSection/updateSetSectionPosition/${direction}] - Successfully moved set section ${direction}:\n${setSectionToUpdate} new position: ${targetPosition}.\n${setSectionToSwap.id} new position: ${position}`,
      );
    } else {
      console.info(
        `🤖 - [setSection/updateSetSectionPosition/${direction}] - Preparing to move set section the ${direction} position`,
      );

      await updateTransaction
        .update(setSections)
        .set({
          position:
            direction === "first" ? sql`position + 1` : sql`position - 1`,
        })
        .where(
          and(
            eq(setSections.setId, setSection.setId),
            direction === "first"
              ? lt(setSections.position, position)
              : gt(setSections.position, position),
          ),
        );

      await updateTransaction
        .update(setSections)
        .set({ position: targetPosition })
        .where(eq(setSections.id, setSection.id));

      console.info(
        `🤖 - [setSection/updateSetSectionPosition/${direction}] - Successfully moved set section to the ${direction} position:\n${setSectionToUpdate} new position: ${targetPosition}.`,
      );
    }

    return {
      success: true,
      message: `Successfully moved set section ${setSectionToUpdate} ${direction}`,
    };
  });
};
