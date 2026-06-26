import { createSetSectionFixture } from "@testUtils/fixtures/setSections";
import {
  createSetSectionSongDataAccessFixture,
  type MockSetSectionSongDataAccess,
} from "@testUtils/fixtures/setSectionSongs";
import { createSetSectionSongFixture } from "@testUtils/fixtures/setSectionSongs";
import { createSongFixture, createSongKey } from "@testUtils/fixtures/songs";
import { createUuid } from "@testUtils/generators/createUuid";
import { expectTRPCErrorCode } from "@testUtils/models/resource/expectTRPCErrorCode";

import {
  addAndReorderSongsForOrganization,
  createSetSectionSongForOrganization,
  deleteSetSectionSongForOrganization,
  moveSetSectionSongToAdjacentSectionForOrganization,
  replaceSetSectionSongForOrganization,
  type SetSectionSongWithSetSection,
  swapSetSectionSongPositionForOrganization,
  updateSetSectionSongDetailsForOrganization,
} from "../setSectionSongMutations";

const createSetSectionSongWithSetSectionFixture = (
  overrides: Partial<SetSectionSongWithSetSection> = {},
): SetSectionSongWithSetSection => {
  const {
    setSection: setSectionOverride,
    ...setSectionSongOverrides
  } = overrides;
  const organizationId =
    setSectionSongOverrides.organizationId ??
    setSectionOverride?.organizationId ??
    createUuid();
  const setSection = createSetSectionFixture({
    organizationId,
    ...setSectionOverride,
  });

  return {
    ...createSetSectionSongFixture({
      organizationId,
      setSectionId: setSection.id,
      ...setSectionSongOverrides,
    }),
    setSection,
  };
};

const createDataAccess = (
  overrides: Partial<MockSetSectionSongDataAccess> = {},
) => createSetSectionSongDataAccessFixture(overrides);

describe("set section song mutation services", () => {
  describe("createSetSectionSongForOrganization", () => {
    it("rejects organization mismatches before fetching the set section", async () => {
      const organizationId = createUuid();
      const dataAccess = createDataAccess();

      await expectTRPCErrorCode(
        createSetSectionSongForOrganization({
          input: {
            organizationId: createUuid(),
            songId: createUuid(),
            setSectionId: createUuid(),
            key: createSongKey(),
            notes: null,
            position: 1,
          },
          userOrganizationId: organizationId,
          setSectionSongDataAccess: dataAccess,
        }),
        "BAD_REQUEST",
      );

      expect(dataAccess.findSetSectionById).not.toHaveBeenCalled();
      expect(dataAccess.createSetSectionSong).not.toHaveBeenCalled();
    });

    it("shifts later positions before inserting the new section song", async () => {
      const setSection = createSetSectionFixture();
      const createdSong = createSetSectionSongFixture({
        organizationId: setSection.organizationId,
        setSectionId: setSection.id,
        position: 1,
      });
      const dataAccess = createDataAccess({
        findSetSectionById: jest.fn().mockResolvedValue(setSection),
        createSetSectionSong: jest.fn().mockResolvedValue(createdSong),
      });

      await expect(
        createSetSectionSongForOrganization({
          input: {
            organizationId: setSection.organizationId,
            songId: createdSong.songId,
            setSectionId: setSection.id,
            key: createdSong.key,
            notes: createdSong.notes,
            position: createdSong.position,
          },
          userOrganizationId: setSection.organizationId,
          setSectionSongDataAccess: dataAccess,
        }),
      ).resolves.toEqual([createdSong]);

      expect(dataAccess.lockSetSectionForUpdate).toHaveBeenCalledWith(
        setSection.id,
      );
      expect(dataAccess.shiftSetSectionSongPositionsFrom).toHaveBeenCalledWith(
        setSection.id,
        createdSong.position,
        1,
      );
      expect(dataAccess.createSetSectionSong).toHaveBeenCalledWith({
        organizationId: setSection.organizationId,
        songId: createdSong.songId,
        setSectionId: setSection.id,
        key: createdSong.key,
        notes: createdSong.notes,
        position: createdSong.position,
      });
    });
  });

  describe("deleteSetSectionSongForOrganization", () => {
    it("deletes the target song and compacts later positions", async () => {
      const sectionSong = createSetSectionSongWithSetSectionFixture({
        position: 2,
      });
      const dataAccess = createDataAccess({
        findSetSectionSongById: jest.fn().mockResolvedValue(sectionSong),
        deleteSetSectionSong: jest.fn().mockResolvedValue(sectionSong),
      });

      await expect(
        deleteSetSectionSongForOrganization({
          setSectionSongId: sectionSong.id,
          userOrganizationId: sectionSong.organizationId,
          setSectionSongDataAccess: dataAccess,
        }),
      ).resolves.toEqual(sectionSong);

      expect(dataAccess.deleteSetSectionSong).toHaveBeenCalledWith(
        sectionSong.id,
      );
      expect(dataAccess.shiftSetSectionSongPositionsFrom).toHaveBeenCalledWith(
        sectionSong.setSectionId,
        sectionSong.position + 1,
        -1,
      );
    });

    it("rejects deleting songs from another organization", async () => {
      const sectionSong = createSetSectionSongWithSetSectionFixture();
      const dataAccess = createDataAccess({
        findSetSectionSongById: jest.fn().mockResolvedValue(sectionSong),
      });

      await expectTRPCErrorCode(
        deleteSetSectionSongForOrganization({
          setSectionSongId: sectionSong.id,
          userOrganizationId: createUuid(),
          setSectionSongDataAccess: dataAccess,
        }),
        "FORBIDDEN",
      );

      expect(dataAccess.deleteSetSectionSong).not.toHaveBeenCalled();
      expect(dataAccess.shiftSetSectionSongPositionsFrom).not.toHaveBeenCalled();
    });

    it("returns NOT_FOUND when the song cannot be found", async () => {
      const dataAccess = createDataAccess({
        findSetSectionSongById: jest.fn().mockResolvedValue(null),
      });

      await expectTRPCErrorCode(
        deleteSetSectionSongForOrganization({
          setSectionSongId: createUuid(),
          userOrganizationId: createUuid(),
          setSectionSongDataAccess: dataAccess,
        }),
        "NOT_FOUND",
      );
    });
  });

  describe("swapSetSectionSongPositionForOrganization", () => {
    it("swaps with the adjacent song in the requested direction", async () => {
      const sectionId = createUuid();
      const currentSong = createSetSectionSongWithSetSectionFixture({
        setSectionId: sectionId,
        position: 1,
      });
      const previousSong = createSetSectionSongFixture({
        organizationId: currentSong.organizationId,
        setSectionId: sectionId,
        position: 0,
      });
      const dataAccess = createDataAccess({
        findSetSectionSongById: jest.fn().mockResolvedValue(currentSong),
        findSetSectionSongsBySetSectionId: jest
          .fn()
          .mockResolvedValue([previousSong, currentSong]),
      });

      await expect(
        swapSetSectionSongPositionForOrganization({
          setSectionSongId: currentSong.id,
          direction: "up",
          userOrganizationId: currentSong.organizationId,
          setSectionSongDataAccess: dataAccess,
        }),
      ).resolves.toEqual({
        success: true,
        message: `Successfully moved song ${currentSong.id} up`,
      });

      expect(dataAccess.updateSetSectionSong).toHaveBeenCalledWith(
        currentSong.id,
        { position: previousSong.position },
      );
      expect(dataAccess.updateSetSectionSong).toHaveBeenCalledWith(
        previousSong.id,
        { position: currentSong.position },
      );
    });

    it("does not write when the song is already at the boundary", async () => {
      const currentSong = createSetSectionSongWithSetSectionFixture({
        position: 0,
      });
      const dataAccess = createDataAccess({
        findSetSectionSongById: jest.fn().mockResolvedValue(currentSong),
        findSetSectionSongsBySetSectionId: jest
          .fn()
          .mockResolvedValue([currentSong]),
      });

      await expect(
        swapSetSectionSongPositionForOrganization({
          setSectionSongId: currentSong.id,
          direction: "up",
          userOrganizationId: currentSong.organizationId,
          setSectionSongDataAccess: dataAccess,
        }),
      ).resolves.toEqual({
        success: false,
        message: "Cannot move up from current position",
      });

      expect(dataAccess.updateSetSectionSong).not.toHaveBeenCalled();
    });
  });

  describe("moveSetSectionSongToAdjacentSectionForOrganization", () => {
    it("moves a song to the end of the adjacent section and compacts the source section", async () => {
      const setId = createUuid();
      const sourceSection = createSetSectionFixture({ setId, position: 0 });
      const targetSection = createSetSectionFixture({
        setId,
        position: 1,
        organizationId: sourceSection.organizationId,
      });
      const sectionSong = createSetSectionSongWithSetSectionFixture({
        organizationId: sourceSection.organizationId,
        setSectionId: sourceSection.id,
        setSection: sourceSection,
        position: 1,
      });
      const targetSectionSongs = [
        createSetSectionSongFixture({
          organizationId: sourceSection.organizationId,
          setSectionId: targetSection.id,
          position: 0,
        }),
        createSetSectionSongFixture({
          organizationId: sourceSection.organizationId,
          setSectionId: targetSection.id,
          position: 1,
        }),
      ];
      const movedSong = {
        ...sectionSong,
        setSectionId: targetSection.id,
        position: 2,
      };
      const dataAccess = createDataAccess({
        findSetSectionSongById: jest.fn().mockResolvedValue(sectionSong),
        findAdjacentSetSection: jest.fn().mockResolvedValue(targetSection),
        findSetSectionSongsBySetSectionId: jest
          .fn()
          .mockResolvedValue(targetSectionSongs),
        updateSetSectionSong: jest.fn().mockResolvedValue(movedSong),
      });

      await expect(
        moveSetSectionSongToAdjacentSectionForOrganization({
          setSectionSongId: sectionSong.id,
          direction: "next",
          userOrganizationId: sourceSection.organizationId,
          setSectionSongDataAccess: dataAccess,
        }),
      ).resolves.toEqual({
        success: true,
        newSetSectionId: targetSection.id,
        newPosition: 2,
      });

      expect(dataAccess.findAdjacentSetSection).toHaveBeenCalledWith(setId, 1);
      expect(dataAccess.shiftSetSectionSongPositionsFrom).toHaveBeenCalledWith(
        sourceSection.id,
        sectionSong.position + 1,
        -1,
      );
      expect(dataAccess.updateSetSectionSong).toHaveBeenCalledWith(
        sectionSong.id,
        {
          setSectionId: targetSection.id,
          position: 2,
        },
      );
    });

    it("maps a missing adjacent section to BAD_REQUEST", async () => {
      const sectionSong = createSetSectionSongWithSetSectionFixture();
      const dataAccess = createDataAccess({
        findSetSectionSongById: jest.fn().mockResolvedValue(sectionSong),
        findAdjacentSetSection: jest.fn().mockResolvedValue(null),
      });

      await expectTRPCErrorCode(
        moveSetSectionSongToAdjacentSectionForOrganization({
          setSectionSongId: sectionSong.id,
          direction: "previous",
          userOrganizationId: sectionSong.organizationId,
          setSectionSongDataAccess: dataAccess,
        }),
        "BAD_REQUEST",
      );

      expect(dataAccess.updateSetSectionSong).not.toHaveBeenCalled();
    });
  });

  describe("replaceSetSectionSongForOrganization", () => {
    it("updates the song id when the replacement belongs to the same organization", async () => {
      const sectionSong = createSetSectionSongWithSetSectionFixture();
      const replacementSong = createSongFixture({
        organizationId: sectionSong.organizationId,
      });
      const dataAccess = createDataAccess({
        findSetSectionSongById: jest.fn().mockResolvedValue(sectionSong),
        findSongById: jest.fn().mockResolvedValue(replacementSong),
        updateSetSectionSong: jest.fn().mockResolvedValue({
          ...sectionSong,
          songId: replacementSong.id,
        }),
      });

      await expect(
        replaceSetSectionSongForOrganization({
          input: {
            setSectionSongId: sectionSong.id,
            replacementSongId: replacementSong.id,
          },
          userOrganizationId: sectionSong.organizationId,
          setSectionSongDataAccess: dataAccess,
        }),
      ).resolves.toEqual({
        success: true,
        setSectionSong: sectionSong.id,
        replacementSong: replacementSong.id,
      });

      expect(dataAccess.updateSetSectionSong).toHaveBeenCalledWith(
        sectionSong.id,
        { songId: replacementSong.id },
      );
    });

    it("rejects replacement songs from another organization", async () => {
      const sectionSong = createSetSectionSongWithSetSectionFixture();
      const dataAccess = createDataAccess({
        findSetSectionSongById: jest.fn().mockResolvedValue(sectionSong),
        findSongById: jest.fn().mockResolvedValue(createSongFixture()),
      });

      await expectTRPCErrorCode(
        replaceSetSectionSongForOrganization({
          input: {
            setSectionSongId: sectionSong.id,
            replacementSongId: createUuid(),
          },
          userOrganizationId: sectionSong.organizationId,
          setSectionSongDataAccess: dataAccess,
        }),
        "BAD_REQUEST",
      );

      expect(dataAccess.updateSetSectionSong).not.toHaveBeenCalled();
    });
  });

  describe("updateSetSectionSongDetailsForOrganization", () => {
    it("rejects updates outside of the user's organization before fetching the song", async () => {
      const sectionSong = createSetSectionSongWithSetSectionFixture();
      const dataAccess = createDataAccess();

      await expectTRPCErrorCode(
        updateSetSectionSongDetailsForOrganization({
          input: {
            id: sectionSong.id,
            organizationId: createUuid(),
            key: createSongKey(),
          },
          userOrganizationId: sectionSong.organizationId,
          setSectionSongDataAccess: dataAccess,
        }),
        "FORBIDDEN",
      );

      expect(dataAccess.findSetSectionSongById).not.toHaveBeenCalled();
      expect(dataAccess.updateSetSectionSong).not.toHaveBeenCalled();
    });

    it("writes only changed fields", async () => {
      const sectionSong = createSetSectionSongWithSetSectionFixture({
        key: "c",
        notes: "old notes",
      });
      const updatedSong = {
        ...sectionSong,
        key: "d" as const,
      };
      const dataAccess = createDataAccess({
        findSetSectionSongById: jest.fn().mockResolvedValue(sectionSong),
        updateSetSectionSong: jest.fn().mockResolvedValue(updatedSong),
      });

      await expect(
        updateSetSectionSongDetailsForOrganization({
          input: {
            id: sectionSong.id,
            organizationId: sectionSong.organizationId,
            songId: sectionSong.songId,
            setSectionId: sectionSong.setSectionId,
            position: sectionSong.position,
            key: updatedSong.key,
            notes: sectionSong.notes,
          },
          userOrganizationId: sectionSong.organizationId,
          setSectionSongDataAccess: dataAccess,
        }),
      ).resolves.toEqual(updatedSong);

      expect(dataAccess.updateSetSectionSong).toHaveBeenCalledWith(
        sectionSong.id,
        { key: updatedSong.key },
      );
    });

    it("returns the existing song without writing when details are unchanged", async () => {
      const sectionSong = createSetSectionSongWithSetSectionFixture();
      const dataAccess = createDataAccess({
        findSetSectionSongById: jest.fn().mockResolvedValue(sectionSong),
      });

      await expect(
        updateSetSectionSongDetailsForOrganization({
          input: {
            id: sectionSong.id,
            organizationId: sectionSong.organizationId,
            songId: sectionSong.songId,
            setSectionId: sectionSong.setSectionId,
            position: sectionSong.position,
            key: sectionSong.key,
            notes: sectionSong.notes,
          },
          userOrganizationId: sectionSong.organizationId,
          setSectionSongDataAccess: dataAccess,
        }),
      ).resolves.toEqual(sectionSong);

      expect(dataAccess.updateSetSectionSong).not.toHaveBeenCalled();
    });
  });

  describe("addAndReorderSongsForOrganization", () => {
    it("adds the new song and updates only positions that changed", async () => {
      const setSection = createSetSectionFixture();
      const firstSong = createSetSectionSongFixture({
        organizationId: setSection.organizationId,
        setSectionId: setSection.id,
        position: 0,
      });
      const secondSong = createSetSectionSongFixture({
        organizationId: setSection.organizationId,
        setSectionId: setSection.id,
        position: 1,
      });
      const insertedSongKey = createSongKey();
      const insertedSong = createSetSectionSongFixture({
        organizationId: setSection.organizationId,
        setSectionId: setSection.id,
        key: insertedSongKey,
        position: 1,
      });
      const newSongTempId = createUuid();
      const dataAccess = createDataAccess({
        findSetSectionById: jest.fn().mockResolvedValue(setSection),
        findSetSectionSongsBySetSectionId: jest
          .fn()
          .mockResolvedValue([firstSong, secondSong]),
        createSetSectionSong: jest.fn().mockResolvedValue(insertedSong),
      });

      await expect(
        addAndReorderSongsForOrganization({
          input: {
            setSectionId: setSection.id,
            newSong: {
              songId: insertedSong.songId,
              key: insertedSongKey,
              notes: insertedSong.notes ?? undefined,
            },
            newSongTempId,
            orderedSongIds: [firstSong.id, newSongTempId, secondSong.id],
          },
          userOrganizationId: setSection.organizationId,
          setSectionSongDataAccess: dataAccess,
        }),
      ).resolves.toEqual({
        success: true,
        newSetSectionSongId: insertedSong.id,
      });

      expect(dataAccess.lockSetSectionForUpdate).toHaveBeenCalledWith(
        setSection.id,
      );
      expect(dataAccess.createSetSectionSong).toHaveBeenCalledWith({
        organizationId: setSection.organizationId,
        songId: insertedSong.songId,
        setSectionId: setSection.id,
        key: insertedSongKey,
        notes: insertedSong.notes,
        position: 1,
      });
      expect(dataAccess.updateSetSectionSong).toHaveBeenCalledTimes(1);
      expect(dataAccess.updateSetSectionSong).toHaveBeenCalledWith(
        secondSong.id,
        { position: 2 },
      );
    });

    it("appends current songs omitted from the requested order", async () => {
      const setSection = createSetSectionFixture();
      const omittedSong = createSetSectionSongFixture({
        organizationId: setSection.organizationId,
        setSectionId: setSection.id,
        position: 0,
      });
      const insertedSong = createSetSectionSongFixture({
        organizationId: setSection.organizationId,
        setSectionId: setSection.id,
        key: "g",
        position: 0,
      });
      const newSongTempId = createUuid();
      const dataAccess = createDataAccess({
        findSetSectionById: jest.fn().mockResolvedValue(setSection),
        findSetSectionSongsBySetSectionId: jest
          .fn()
          .mockResolvedValue([omittedSong]),
        createSetSectionSong: jest.fn().mockResolvedValue(insertedSong),
      });

      await addAndReorderSongsForOrganization({
        input: {
          setSectionId: setSection.id,
          newSong: {
            songId: insertedSong.songId,
            key: "g",
          },
          newSongTempId,
          orderedSongIds: [newSongTempId],
        },
        userOrganizationId: setSection.organizationId,
        setSectionSongDataAccess: dataAccess,
      });

      expect(dataAccess.updateSetSectionSong).toHaveBeenCalledWith(
        omittedSong.id,
        { position: 1 },
      );
    });

    it("rejects cross-organization set sections before locking", async () => {
      const setSection = createSetSectionFixture();
      const dataAccess = createDataAccess({
        findSetSectionById: jest.fn().mockResolvedValue(setSection),
      });

      await expectTRPCErrorCode(
        addAndReorderSongsForOrganization({
          input: {
            setSectionId: setSection.id,
            newSong: {
              songId: createUuid(),
              key: createSongKey(),
            },
            newSongTempId: createUuid(),
            orderedSongIds: [createUuid()],
          },
          userOrganizationId: createUuid(),
          setSectionSongDataAccess: dataAccess,
        }),
        "FORBIDDEN",
      );

      expect(dataAccess.lockSetSectionForUpdate).not.toHaveBeenCalled();
      expect(dataAccess.createSetSectionSong).not.toHaveBeenCalled();
    });
  });
});
