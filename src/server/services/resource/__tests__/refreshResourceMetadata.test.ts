import { expectTRPCErrorCode } from "@testUtils/models/resource/expectTRPCErrorCode";
import { createResourceFixture } from "@testUtils/models/resource/fixtures";
import {
  createResourceName,
  createResourceUrl,
} from "@testUtils/models/resource/generators";
import { createRefreshResourceMetadataDataAccessFixture } from "@testUtils/models/resource/refreshResourceMetadataDataAccess";

import { refreshResourceMetadataForOrganization } from "../refreshResourceMetadata";
import { type ResourcePreviewMetadata } from "../resourceMetadata";

const createResourcePreviewMetadata = (
  overrides: Partial<ResourcePreviewMetadata> = {},
): ResourcePreviewMetadata => ({
  normalizedUrl: createResourceUrl(),
  status: "ready",
  title: createResourceName(),
  description: "Helpful resource description",
  faviconUrl: createResourceUrl(),
  imageUrl: createResourceUrl(),
  lastFetchedAt: new Date("2026-01-01T00:00:00Z"),
  ...overrides,
});

describe("refreshResourceMetadataForOrganization", () => {
  it("updates resource metadata when the refresh succeeds", async () => {
    const resource = createResourceFixture();
    const refreshedMetadata = createResourcePreviewMetadata();
    const updatedResource = {
      ...resource,
      url: refreshedMetadata.normalizedUrl,
      status: "ready" as const,
      metaTitle: refreshedMetadata.title,
      metaDescription: refreshedMetadata.description,
      faviconUrl: refreshedMetadata.faviconUrl,
      imageUrl: refreshedMetadata.imageUrl,
      lastFetchedAt: refreshedMetadata.lastFetchedAt,
    };
    const resourceDataAccess = createRefreshResourceMetadataDataAccessFixture({
      findResourceById: jest.fn().mockResolvedValue(resource),
      updateResourceMetadata: jest.fn().mockResolvedValue(updatedResource),
    });
    const fetchMetadata = jest.fn().mockResolvedValue(refreshedMetadata);

    await expect(
      refreshResourceMetadataForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: resource.organizationId,
        },
        userOrganizationId: resource.organizationId,
        resourceDataAccess,
        fetchMetadata,
      }),
    ).resolves.toEqual(updatedResource);

    expect(fetchMetadata).toHaveBeenCalledWith(resource.url);
    expect(resourceDataAccess.updateResourceMetadata).toHaveBeenCalledWith(
      resource.id,
      {
        url: refreshedMetadata.normalizedUrl,
        status: "ready",
        metaTitle: refreshedMetadata.title,
        metaDescription: refreshedMetadata.description,
        faviconUrl: refreshedMetadata.faviconUrl,
        imageUrl: refreshedMetadata.imageUrl,
        lastFetchedAt: refreshedMetadata.lastFetchedAt,
      },
    );
  });

  it("does not overwrite existing metadata when the refresh fetch fails", async () => {
    const resource = createResourceFixture({
      status: "ready",
      metaTitle: "Existing title",
      metaDescription: "Existing description",
      faviconUrl: createResourceUrl(),
      imageUrl: createResourceUrl(),
      lastFetchedAt: new Date("2026-01-01T00:00:00Z"),
    });
    const resourceDataAccess = createRefreshResourceMetadataDataAccessFixture({
      findResourceById: jest.fn().mockResolvedValue(resource),
    });
    const fetchMetadata = jest.fn().mockResolvedValue(
      createResourcePreviewMetadata({
        normalizedUrl: resource.url,
        status: "failed",
        title: null,
        description: null,
        faviconUrl: null,
        imageUrl: null,
      }),
    );

    await expectTRPCErrorCode(
      refreshResourceMetadataForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: resource.organizationId,
        },
        userOrganizationId: resource.organizationId,
        resourceDataAccess,
        fetchMetadata,
      }),
      "BAD_REQUEST",
    );

    expect(resourceDataAccess.updateResourceMetadata).not.toHaveBeenCalled();
  });
});
