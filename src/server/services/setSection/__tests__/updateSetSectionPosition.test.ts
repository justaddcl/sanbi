import { createSetSectionFixture } from "@testUtils/fixtures/setSections";
import { createUuid } from "@testUtils/generators/createUuid";

import { type SetSection } from "@lib/types";
import {
  type SetSectionPositionDataAccess,
  type ShiftSetSectionPositionsOptions,
  updateSetSectionPositionForSet,
} from "@server/services/setSection/updateSetSectionPosition";

type MockSetSectionPositionDataAccess = {
  [Method in keyof SetSectionPositionDataAccess]: jest.MockedFunction<
    SetSectionPositionDataAccess[Method]
  >;
};

const createSetSectionsForSet = (positions: number[]) => {
  const setId = createUuid();

  return positions.map((position) =>
    createSetSectionFixture({
      position,
      setId,
    }),
  );
};

const createSetSectionPositionDataAccessFixture = (
  setSections: SetSection[],
): MockSetSectionPositionDataAccess => ({
  findMaxSetSectionPosition: jest.fn(async (setId) => {
    const positions = setSections
      .filter((setSection) => setSection.setId === setId)
      .map((setSection) => setSection.position);

    if (positions.length === 0) {
      return null;
    }

    return Math.max(...positions);
  }),
  findSetSectionById: jest.fn(async (setSectionId) => {
    return (
      setSections.find((setSection) => setSection.id === setSectionId) ?? null
    );
  }),
  findSetSectionBySetIdAndPosition: jest.fn(async (setId, position) => {
    return (
      setSections.find(
        (setSection) =>
          setSection.setId === setId && setSection.position === position,
      ) ?? null
    );
  }),
  shiftSetSectionPositions: jest.fn(
    async (setId, options: ShiftSetSectionPositionsOptions) => {
      setSections.forEach((setSection) => {
        if (setSection.setId !== setId) {
          return;
        }

        const shouldShift =
          options.positionLessThan !== undefined
            ? setSection.position < options.positionLessThan
            : setSection.position > options.positionGreaterThan;

        if (shouldShift) {
          setSection.position += options.positionDelta;
        }
      });
    },
  ),
  updateSetSectionPosition: jest.fn(async (setSectionId, position) => {
    const setSection = setSections.find(
      (candidateSetSection) => candidateSetSection.id === setSectionId,
    );

    if (setSection) {
      setSection.position = position;
    }
  }),
});

const getPositionsBySectionId = (setSections: SetSection[]) =>
  Object.fromEntries(
    setSections.map((setSection) => [setSection.id, setSection.position]),
  );

const findSetSectionByPosition = (
  setSections: SetSection[],
  position: number,
) => {
  const setSection = setSections.find(
    (candidateSetSection) => candidateSetSection.position === position,
  );

  if (!setSection) {
    throw new Error(`Could not find set section at position ${position}`);
  }

  return setSection;
};

describe("updateSetSectionPositionForSet", () => {
  it("returns a failure result when the section does not exist", async () => {
    const setSections = createSetSectionsForSet([0, 1, 2]);
    const setSectionPositionDataAccess =
      createSetSectionPositionDataAccessFixture(setSections);

    await expect(
      updateSetSectionPositionForSet({
        direction: "up",
        setSectionId: createUuid(),
        setSectionPositionDataAccess,
      }),
    ).resolves.toEqual({
      success: false,
      message: "Set section not found",
    });

    expect(
      setSectionPositionDataAccess.findMaxSetSectionPosition,
    ).not.toHaveBeenCalled();
    expect(
      setSectionPositionDataAccess.updateSetSectionPosition,
    ).not.toHaveBeenCalled();
    expect(
      setSectionPositionDataAccess.shiftSetSectionPositions,
    ).not.toHaveBeenCalled();
  });

  it.each([
    { direction: "up" as const, success: false },
    { direction: "down" as const, success: false },
    { direction: "first" as const, success: true },
    { direction: "last" as const, success: true },
  ])(
    "does not move a one-section set incorrectly when moving $direction",
    async ({ direction, success }) => {
      const setSection = findSetSectionByPosition(
        createSetSectionsForSet([0]),
        0,
      );
      const setSections = [setSection];
      const setSectionPositionDataAccess =
        createSetSectionPositionDataAccessFixture(setSections);

      await expect(
        updateSetSectionPositionForSet({
          direction,
          setSectionId: setSection.id,
          setSectionPositionDataAccess,
        }),
      ).resolves.toEqual(
        expect.objectContaining({
          success,
        }),
      );

      expect(setSection.position).toBe(0);
      expect(
        setSectionPositionDataAccess.updateSetSectionPosition,
      ).not.toHaveBeenCalled();
      expect(
        setSectionPositionDataAccess.shiftSetSectionPositions,
      ).not.toHaveBeenCalled();
    },
  );

  it("prevents the first section from moving up", async () => {
    const setSections = createSetSectionsForSet([0, 1, 2]);
    const firstSection = findSetSectionByPosition(setSections, 0);
    const setSectionPositionDataAccess =
      createSetSectionPositionDataAccessFixture(setSections);

    await expect(
      updateSetSectionPositionForSet({
        direction: "up",
        setSectionId: firstSection.id,
        setSectionPositionDataAccess,
      }),
    ).resolves.toEqual({
      success: false,
      message: "Cannot move up from current position",
    });

    expect(
      setSectionPositionDataAccess.updateSetSectionPosition,
    ).not.toHaveBeenCalled();
  });

  it("prevents the last section from moving down", async () => {
    const setSections = createSetSectionsForSet([0, 1, 2]);
    const lastSection = findSetSectionByPosition(setSections, 2);
    const setSectionPositionDataAccess =
      createSetSectionPositionDataAccessFixture(setSections);

    await expect(
      updateSetSectionPositionForSet({
        direction: "down",
        setSectionId: lastSection.id,
        setSectionPositionDataAccess,
      }),
    ).resolves.toEqual({
      success: false,
      message: "Cannot move down from current position",
    });

    expect(
      setSectionPositionDataAccess.updateSetSectionPosition,
    ).not.toHaveBeenCalled();
  });

  it("swaps exactly two positions when moving a section up", async () => {
    const setSections = createSetSectionsForSet([0, 1, 2]);
    const previousSection = findSetSectionByPosition(setSections, 0);
    const movedSection = findSetSectionByPosition(setSections, 1);
    const untouchedSection = findSetSectionByPosition(setSections, 2);
    const originalPositionsBySectionId = getPositionsBySectionId(setSections);
    const setSectionPositionDataAccess =
      createSetSectionPositionDataAccessFixture(setSections);

    await expect(
      updateSetSectionPositionForSet({
        direction: "up",
        setSectionId: movedSection.id,
        setSectionPositionDataAccess,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        success: true,
      }),
    );

    expect(getPositionsBySectionId(setSections)).toEqual({
      [previousSection.id]: originalPositionsBySectionId[movedSection.id],
      [movedSection.id]: originalPositionsBySectionId[previousSection.id],
      [untouchedSection.id]: originalPositionsBySectionId[untouchedSection.id],
    });
    expect(
      setSectionPositionDataAccess.updateSetSectionPosition,
    ).toHaveBeenCalledTimes(2);
    expect(
      setSectionPositionDataAccess.shiftSetSectionPositions,
    ).not.toHaveBeenCalled();
  });

  it.each([
    { direction: "up" as const, position: 2 },
    { direction: "down" as const, position: 0 },
  ])(
    "returns a failure result when moving $direction without an adjacent swap section",
    async ({ direction, position }) => {
      const setSections = createSetSectionsForSet([0, 2]);
      const movedSection = findSetSectionByPosition(setSections, position);
      const setSectionPositionDataAccess =
        createSetSectionPositionDataAccessFixture(setSections);

      await expect(
        updateSetSectionPositionForSet({
          direction,
          setSectionId: movedSection.id,
          setSectionPositionDataAccess,
        }),
      ).resolves.toEqual({
        success: false,
        message: `No set section to swap with ${direction}`,
      });

      expect(
        setSectionPositionDataAccess.updateSetSectionPosition,
      ).not.toHaveBeenCalled();
      expect(
        setSectionPositionDataAccess.shiftSetSectionPositions,
      ).not.toHaveBeenCalled();
    },
  );

  it("swaps exactly two positions when moving a section down", async () => {
    const setSections = createSetSectionsForSet([0, 1, 2]);
    const movedSection = findSetSectionByPosition(setSections, 1);
    const nextSection = findSetSectionByPosition(setSections, 2);
    const untouchedSection = findSetSectionByPosition(setSections, 0);
    const originalPositionsBySectionId = getPositionsBySectionId(setSections);
    const setSectionPositionDataAccess =
      createSetSectionPositionDataAccessFixture(setSections);

    await expect(
      updateSetSectionPositionForSet({
        direction: "down",
        setSectionId: movedSection.id,
        setSectionPositionDataAccess,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        success: true,
      }),
    );

    expect(getPositionsBySectionId(setSections)).toEqual({
      [movedSection.id]: originalPositionsBySectionId[nextSection.id],
      [nextSection.id]: originalPositionsBySectionId[movedSection.id],
      [untouchedSection.id]: originalPositionsBySectionId[untouchedSection.id],
    });
    expect(
      setSectionPositionDataAccess.updateSetSectionPosition,
    ).toHaveBeenCalledTimes(2);
    expect(
      setSectionPositionDataAccess.shiftSetSectionPositions,
    ).not.toHaveBeenCalled();
  });

  it("moves a section to first by shifting intermediate sections down", async () => {
    const setSections = createSetSectionsForSet([0, 1, 2, 3]);
    const movedSection = findSetSectionByPosition(setSections, 3);
    const firstSection = findSetSectionByPosition(setSections, 0);
    const secondSection = findSetSectionByPosition(setSections, 1);
    const thirdSection = findSetSectionByPosition(setSections, 2);
    const movedSectionOriginalPosition = movedSection.position;
    const firstSectionOriginalPosition = firstSection.position;
    const secondSectionOriginalPosition = secondSection.position;
    const thirdSectionOriginalPosition = thirdSection.position;
    const setSectionPositionDataAccess =
      createSetSectionPositionDataAccessFixture(setSections);

    await expect(
      updateSetSectionPositionForSet({
        direction: "first",
        setSectionId: movedSection.id,
        setSectionPositionDataAccess,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        success: true,
      }),
    );

    expect(getPositionsBySectionId(setSections)).toEqual({
      [firstSection.id]: firstSectionOriginalPosition + 1,
      [secondSection.id]: secondSectionOriginalPosition + 1,
      [thirdSection.id]: thirdSectionOriginalPosition + 1,
      [movedSection.id]: 0,
    });
    expect(
      setSectionPositionDataAccess.shiftSetSectionPositions,
    ).toHaveBeenCalledWith(movedSection.setId, {
      positionDelta: 1,
      positionLessThan: movedSectionOriginalPosition,
    });
  });

  it("moves a section to last by shifting intermediate sections up", async () => {
    const setSections = createSetSectionsForSet([0, 1, 2, 3]);
    const movedSection = findSetSectionByPosition(setSections, 0);
    const secondSection = findSetSectionByPosition(setSections, 1);
    const thirdSection = findSetSectionByPosition(setSections, 2);
    const lastSection = findSetSectionByPosition(setSections, 3);
    const movedSectionOriginalPosition = movedSection.position;
    const secondSectionOriginalPosition = secondSection.position;
    const thirdSectionOriginalPosition = thirdSection.position;
    const lastSectionOriginalPosition = lastSection.position;
    const setSectionPositionDataAccess =
      createSetSectionPositionDataAccessFixture(setSections);

    await expect(
      updateSetSectionPositionForSet({
        direction: "last",
        setSectionId: movedSection.id,
        setSectionPositionDataAccess,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        success: true,
      }),
    );

    expect(getPositionsBySectionId(setSections)).toEqual({
      [movedSection.id]: 3,
      [secondSection.id]: secondSectionOriginalPosition - 1,
      [thirdSection.id]: thirdSectionOriginalPosition - 1,
      [lastSection.id]: lastSectionOriginalPosition - 1,
    });
    expect(
      setSectionPositionDataAccess.shiftSetSectionPositions,
    ).toHaveBeenCalledWith(movedSection.setId, {
      positionDelta: -1,
      positionGreaterThan: movedSectionOriginalPosition,
    });
  });
});
