import { type SetSectionSongDataAccess } from "@server/services/setSectionSong/setSectionSongMutations";

export type MockSetSectionSongDataAccess = {
  [Method in keyof SetSectionSongDataAccess]: jest.MockedFunction<
    SetSectionSongDataAccess[Method]
  >;
};

export const createSetSectionSongDataAccessFixture = (
  overrides: Partial<MockSetSectionSongDataAccess> = {},
): MockSetSectionSongDataAccess => ({
  createSetSectionSong: jest.fn(),
  deleteSetSectionSong: jest.fn(),
  findAdjacentSetSection: jest.fn(),
  findSetSectionById: jest.fn(),
  findSetSectionSongById: jest.fn(),
  findSetSectionSongsBySetSectionId: jest.fn(),
  findSongById: jest.fn(),
  lockSetSectionForUpdate: jest.fn().mockResolvedValue(undefined),
  shiftSetSectionSongPositionsFrom: jest.fn(),
  updateSetSectionSong: jest.fn(),
  ...overrides,
});
