import { type RefreshResourceMetadataDataAccess } from "@server/services/resource/refreshResourceMetadata";

export type MockRefreshResourceMetadataDataAccess = {
  findResourceById: jest.MockedFunction<
    RefreshResourceMetadataDataAccess["findResourceById"]
  >;
  updateResourceMetadata: jest.MockedFunction<
    RefreshResourceMetadataDataAccess["updateResourceMetadata"]
  >;
};

export const createRefreshResourceMetadataDataAccessFixture = (
  overrides: Partial<MockRefreshResourceMetadataDataAccess> = {},
): MockRefreshResourceMetadataDataAccess => ({
  findResourceById: jest.fn(),
  updateResourceMetadata: jest.fn(),
  ...overrides,
});
