import { type UpdateResourceData } from "@server/orpc/services/resource/updateResource";

export type MockUpdateResourceData = {
  findResourceById: jest.MockedFunction<UpdateResourceData["findResourceById"]>;
  updateResource: jest.MockedFunction<UpdateResourceData["updateResource"]>;
};

export const createUpdateResourceDataFixture = (
  overrides: Partial<MockUpdateResourceData> = {},
): MockUpdateResourceData => ({
  findResourceById: jest.fn(),
  updateResource: jest.fn(),
  ...overrides,
});
