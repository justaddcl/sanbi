import {
  type NewSetSection,
  type SetSection,
  type SetSectionTypeType,
  type SetSectionWithSongs,
} from "@lib/types";

export type SetSectionDataAccess = {
  createSetSection: (setSection: NewSetSection) => Promise<SetSection | null>;
  decrementSetSectionPositionsAfter: (
    setId: string,
    position: number,
  ) => Promise<void>;
  deleteSetSection: (setSectionId: string) => Promise<SetSection | null>;
  findSetSectionById: (
    setSectionId: string,
  ) => Promise<SetSectionWithSongs | null>;
  findSetSectionTypeById: (
    setSectionTypeId: string,
  ) => Promise<SetSectionTypeType | null>;
  findSetSectionsBySetId: (setId: string) => Promise<SetSectionWithSongs[]>;
  updateSetSectionPosition: (
    setSectionId: string,
    position: number,
  ) => Promise<SetSection | null>;
  updateSetSectionType: (
    setSectionId: string,
    sectionTypeId: string,
  ) => Promise<SetSection | null>;
};

export type MockSetSectionDataAccess = {
  [Method in keyof SetSectionDataAccess]: jest.MockedFunction<
    SetSectionDataAccess[Method]
  >;
};

export const createSetSectionDataAccessFixture = (
  overrides: Partial<MockSetSectionDataAccess> = {},
): MockSetSectionDataAccess => ({
  createSetSection: jest.fn(),
  decrementSetSectionPositionsAfter: jest.fn(),
  deleteSetSection: jest.fn(),
  findSetSectionById: jest.fn(),
  findSetSectionTypeById: jest.fn(),
  findSetSectionsBySetId: jest.fn(),
  updateSetSectionPosition: jest.fn(),
  updateSetSectionType: jest.fn(),
  ...overrides,
});
