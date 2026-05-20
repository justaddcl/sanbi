import { type DeleteResourceDataAccess } from "@server/orpc/services/resource/deleteResource";

export type MockDeleteResourceDataAccess = {
  findResourceById: jest.MockedFunction<
    DeleteResourceDataAccess["findResourceById"]
  >;
  deleteResource: jest.MockedFunction<
    DeleteResourceDataAccess["deleteResource"]
  >;
};

export const createDeleteResourceDataAccessFixture = (
  overrides: Partial<MockDeleteResourceDataAccess> = {},
): MockDeleteResourceDataAccess => ({
  findResourceById: jest.fn(),
  deleteResource: jest.fn(),
  ...overrides,
});
