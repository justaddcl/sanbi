import { type UpdateResourceDataAccess } from "@server/orpc/services/resource/updateResource";

export type MockUpdateResourceDataAccess = {
  findResourceById: jest.MockedFunction<
    UpdateResourceDataAccess["findResourceById"]
  >;
  updateResource: jest.MockedFunction<
    UpdateResourceDataAccess["updateResource"]
  >;
};

export const createUpdateResourceDataAccessFixture = (
  overrides: Partial<MockUpdateResourceDataAccess> = {},
): MockUpdateResourceDataAccess => ({
  findResourceById: jest.fn(),
  updateResource: jest.fn(),
  ...overrides,
});
