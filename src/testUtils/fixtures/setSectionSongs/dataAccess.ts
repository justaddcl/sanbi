import {
  type NewSetSectionSong,
  type SetSection,
  type SetSectionSong,
  type SetSectionSongWithSongData,
  type Song,
} from "@lib/types";

export type SetSectionSongDataAccess = {
  createSetSectionSong: (
    setSectionSong: NewSetSectionSong,
  ) => Promise<SetSectionSong | null>;
  deleteSetSectionSong: (
    setSectionSongId: string,
  ) => Promise<SetSectionSong | null>;
  findSetSectionById: (setSectionId: string) => Promise<SetSection | null>;
  findSetSectionSongById: (
    setSectionSongId: string,
  ) => Promise<SetSectionSongWithSongData | null>;
  findSetSectionSongsBySetSectionId: (
    setSectionId: string,
  ) => Promise<SetSectionSongWithSongData[]>;
  findSongById: (songId: string) => Promise<Song | null>;
  moveSetSectionSongToSection: (
    setSectionSongId: string,
    setSectionId: string,
    position: number,
  ) => Promise<SetSectionSong | null>;
  shiftSetSectionSongPositionsFrom: (
    setSectionId: string,
    position: number,
    offset: -1 | 1,
  ) => Promise<void>;
  updateSetSectionSong: (
    setSectionSongId: string,
    updates: Partial<
      Pick<
        SetSectionSong,
        "key" | "notes" | "position" | "setSectionId" | "songId"
      >
    >,
  ) => Promise<SetSectionSong | null>;
};

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
  findSetSectionById: jest.fn(),
  findSetSectionSongById: jest.fn(),
  findSetSectionSongsBySetSectionId: jest.fn(),
  findSongById: jest.fn(),
  moveSetSectionSongToSection: jest.fn(),
  shiftSetSectionSongPositionsFrom: jest.fn(),
  updateSetSectionSong: jest.fn(),
  ...overrides,
});
