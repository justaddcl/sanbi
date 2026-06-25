import {
  type EventType,
  type NewSet,
  type SetType,
  type SetWithSectionsSongsAndEventType,
} from "@lib/types";

export type SetDataAccess = {
  archiveSet: (setId: string) => Promise<SetType | null>;
  createSet: (set: NewSet) => Promise<SetType | null>;
  deleteSet: (setId: string) => Promise<SetType | null>;
  findEventTypeById: (eventTypeId: string) => Promise<EventType | null>;
  findSetById: (setId: string) => Promise<SetType | null>;
  findSetWithSectionsById: (
    setId: string,
  ) => Promise<SetWithSectionsSongsAndEventType | null>;
  unarchiveSet: (setId: string) => Promise<SetType | null>;
  updateSetDetails: (
    setId: string,
    updates: Pick<SetType, "date" | "eventTypeId">,
  ) => Promise<SetType | null>;
  updateSetNotes: (
    setId: string,
    notes: SetType["notes"],
  ) => Promise<SetType | null>;
};

export type MockSetDataAccess = {
  [Method in keyof SetDataAccess]: jest.MockedFunction<SetDataAccess[Method]>;
};

export const createSetDataAccessFixture = (
  overrides: Partial<MockSetDataAccess> = {},
): MockSetDataAccess => ({
  archiveSet: jest.fn(),
  createSet: jest.fn(),
  deleteSet: jest.fn(),
  findEventTypeById: jest.fn(),
  findSetById: jest.fn(),
  findSetWithSectionsById: jest.fn(),
  unarchiveSet: jest.fn(),
  updateSetDetails: jest.fn(),
  updateSetNotes: jest.fn(),
  ...overrides,
});
