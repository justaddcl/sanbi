import { type SetSection } from "@lib/types";

export type SwapSetSectionPositionDirection = "first" | "up" | "down" | "last";

export type SwapSetSectionPositionResult = {
  success: boolean;
  message?: string;
};

export type ShiftSetSectionPositionsOptions =
  | {
      positionDelta: 1 | -1;
      positionLessThan: number;
      positionGreaterThan?: never;
    }
  | {
      positionDelta: 1 | -1;
      positionGreaterThan: number;
      positionLessThan?: never;
    };

export type SetSectionPositionDataAccess = {
  findMaxSetSectionPosition: (setId: string) => Promise<number | null>;
  findSetSectionById: (setSectionId: string) => Promise<SetSection | null>;
  findSetSectionBySetIdAndPosition: (
    setId: string,
    position: number,
  ) => Promise<SetSection | null>;
  shiftSetSectionPositions: (
    setId: string,
    options: ShiftSetSectionPositionsOptions,
  ) => Promise<void>;
  updateSetSectionPosition: (
    setSectionId: string,
    position: number,
  ) => Promise<void>;
};

type UpdateSetSectionPositionForSetOptions = {
  direction: SwapSetSectionPositionDirection;
  setSectionId: string;
  setSectionPositionDataAccess: SetSectionPositionDataAccess;
};

export const updateSetSectionPositionForSet = async ({
  direction,
  setSectionId,
  setSectionPositionDataAccess,
}: UpdateSetSectionPositionForSetOptions): Promise<SwapSetSectionPositionResult> => {
  const setSection =
    await setSectionPositionDataAccess.findSetSectionById(setSectionId);

  if (!setSection) {
    return {
      success: false,
      message: "Set section not found",
    };
  }

  const { position } = setSection;

  const maxSetSectionPosition =
    await setSectionPositionDataAccess.findMaxSetSectionPosition(
      setSection.setId,
    );

  if (maxSetSectionPosition === null) {
    return {
      success: false,
      message: "Cannot determine max section position for matching set",
    };
  }

  if (
    (direction === "up" && position === 0) ||
    (direction === "down" && position === maxSetSectionPosition)
  ) {
    return {
      success: false,
      message: `Cannot move ${direction} from current position`,
    };
  }

  const targetPosition = (() => {
    if (direction === "up") {
      return position - 1;
    }

    if (direction === "down") {
      return position + 1;
    }

    if (direction === "last") {
      return maxSetSectionPosition;
    }

    return 0;
  })();

  if (direction === "up" || direction === "down") {
    const setSectionToSwap =
      await setSectionPositionDataAccess.findSetSectionBySetIdAndPosition(
        setSection.setId,
        targetPosition,
      );

    if (!setSectionToSwap) {
      return {
        success: false,
        message: `No set section to swap with ${direction}`,
      };
    }

    await setSectionPositionDataAccess.updateSetSectionPosition(
      setSectionToSwap.id,
      position,
    );
    await setSectionPositionDataAccess.updateSetSectionPosition(
      setSection.id,
      targetPosition,
    );
  } else {
    await setSectionPositionDataAccess.shiftSetSectionPositions(
      setSection.setId,
      direction === "first"
        ? { positionDelta: 1, positionLessThan: position }
        : { positionDelta: -1, positionGreaterThan: position },
    );
    await setSectionPositionDataAccess.updateSetSectionPosition(
      setSection.id,
      targetPosition,
    );
  }

  return {
    success: true,
    message: `Successfully moved set section ${setSectionId} ${direction}`,
  };
};
