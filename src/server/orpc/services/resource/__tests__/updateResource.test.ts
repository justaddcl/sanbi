import { createUuid } from "@testUtils/generators/createUuid";
import { createResourceFixture } from "@testUtils/models/resource/fixtures";
import {
  createResourceName,
  createResourceUrl,
} from "@testUtils/models/resource/generators";
import { createUpdateResourceDataAccessFixture } from "@testUtils/models/resource/updateResourceDataAccess";
import { expectOrpcErrorCode } from "@testUtils/orpc/expectOrpcErrorCode";
import { type MockOrpcErrorModule } from "@testUtils/orpc/mockOrpcError";

import { updateResourceForOrganization } from "@server/orpc/services/resource/updateResource";
import { POSTGRES_UNIQUE_CONSTRAINT_VIOLATION_CODE } from "@server/utils/db/postgres";

import { resolveResourceMetadataForUrl } from "../resourceMetadata";

jest.mock("@orpc/server", () => {
  const { mockOrpcErrorModule } = jest.requireActual<{
    mockOrpcErrorModule: MockOrpcErrorModule;
  }>("@testUtils/orpc/mockOrpcError");

  return mockOrpcErrorModule;
});
jest.mock("@orpc/client", () => {
  const { mockOrpcErrorModule } = jest.requireActual<{
    mockOrpcErrorModule: MockOrpcErrorModule;
  }>("@testUtils/orpc/mockOrpcError");

  return mockOrpcErrorModule;
});
jest.mock("../resourceMetadata", () => ({
  resolveResourceMetadataForUrl: jest.fn(),
}));

const mockResolveResourceMetadataForUrl = jest.mocked(
  resolveResourceMetadataForUrl,
);

const mockResolvedResourceMetadata = (url: string) =>
  mockResolveResourceMetadataForUrl.mockResolvedValueOnce({
    normalizedUrl: url,
    metadataValues: {
      status: "ready",
      metaTitle: "Fetched resource title",
      metaDescription: null,
      faviconUrl: null,
      imageUrl: null,
      lastFetchedAt: new Date("2026-01-01T00:00:00Z"),
    },
  });

describe("updateResourceForOrganization", () => {
  beforeEach(() => {
    mockResolveResourceMetadataForUrl.mockReset();
  });

  it("rejects updates outside of the user's organization before fetching the resource", async () => {
    const resource = createResourceFixture();
    const resourceDataAccess = createUpdateResourceDataAccessFixture();

    await expectOrpcErrorCode(
      updateResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: createUuid(),
          title: createResourceName(),
        },
        userOrganizationId: resource.organizationId,
        resourceDataAccess,
      }),
      "FORBIDDEN",
    );

    expect(resourceDataAccess.findResourceById).not.toHaveBeenCalled();
    expect(resourceDataAccess.updateResource).not.toHaveBeenCalled();
    expect(mockResolveResourceMetadataForUrl).not.toHaveBeenCalled();
  });

  it("returns NOT_FOUND when the target resource does not exist", async () => {
    const organizationId = createUuid();
    const resourceDataAccess = createUpdateResourceDataAccessFixture({
      findResourceById: jest.fn().mockResolvedValue(null),
    });

    await expectOrpcErrorCode(
      updateResourceForOrganization({
        input: {
          resourceId: createUuid(),
          organizationId,
          title: createResourceName(),
        },
        userOrganizationId: organizationId,
        resourceDataAccess,
      }),
      "NOT_FOUND",
    );

    expect(resourceDataAccess.updateResource).not.toHaveBeenCalled();
    expect(mockResolveResourceMetadataForUrl).not.toHaveBeenCalled();
  });

  it("rejects resources that belong to another organization", async () => {
    const organizationId = createUuid();
    const resource = createResourceFixture({
      organizationId: createUuid(),
    });
    const resourceDataAccess = createUpdateResourceDataAccessFixture({
      findResourceById: jest.fn().mockResolvedValue(resource),
    });

    await expectOrpcErrorCode(
      updateResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId,
          title: createResourceName(),
        },
        userOrganizationId: organizationId,
        resourceDataAccess,
      }),
      "FORBIDDEN",
    );

    expect(resourceDataAccess.updateResource).not.toHaveBeenCalled();
    expect(mockResolveResourceMetadataForUrl).not.toHaveBeenCalled();
  });

  it("returns the existing resource without writing when submitted values are unchanged", async () => {
    const resourceUrl = createResourceUrl();
    const resource = createResourceFixture({
      url: resourceUrl,
    });
    const resourceDataAccess = createUpdateResourceDataAccessFixture({
      findResourceById: jest.fn().mockResolvedValue(resource),
    });

    await expect(
      updateResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: resource.organizationId,
          title: resource.title,
          url: resource.url,
        },
        userOrganizationId: resource.organizationId,
        resourceDataAccess,
      }),
    ).resolves.toEqual(resource);

    expect(resourceDataAccess.updateResource).not.toHaveBeenCalled();
    expect(mockResolveResourceMetadataForUrl).not.toHaveBeenCalled();
  });

  it("updates changed fields and normalizes URLs before writing", async () => {
    const originalResourceUrl = createResourceUrl();
    const updatedResourceUrl = createResourceUrl();
    const resource = createResourceFixture({
      url: originalResourceUrl,
    });
    const updatedResource = {
      ...resource,
      title: createResourceName(),
      url: updatedResourceUrl,
    };
    const resourceDataAccess = createUpdateResourceDataAccessFixture({
      findResourceById: jest.fn().mockResolvedValue(resource),
      updateResource: jest.fn().mockResolvedValue(updatedResource),
    });
    mockResolvedResourceMetadata(updatedResource.url);

    await expect(
      updateResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: resource.organizationId,
          title: updatedResource.title,
          url: `  ${updatedResource.url}  `,
        },
        userOrganizationId: resource.organizationId,
        resourceDataAccess,
      }),
    ).resolves.toEqual(updatedResource);

    expect(resourceDataAccess.updateResource).toHaveBeenCalledWith(
      resource.id,
      expect.objectContaining({
        title: updatedResource.title,
        url: updatedResource.url,
        status: "ready",
        metaTitle: "Fetched resource title",
      }),
    );
    expect(mockResolveResourceMetadataForUrl).toHaveBeenCalledWith(
      updatedResource.url,
    );
  });

  it("trims changed resource titles before writing", async () => {
    const resource = createResourceFixture();
    const trimmedTitle = createResourceName();
    const updatedResource = { ...resource, title: trimmedTitle };
    const resourceDataAccess = createUpdateResourceDataAccessFixture({
      findResourceById: jest.fn().mockResolvedValue(resource),
      updateResource: jest.fn().mockResolvedValue(updatedResource),
    });

    await expect(
      updateResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: resource.organizationId,
          title: `  ${trimmedTitle}  `,
        },
        userOrganizationId: resource.organizationId,
        resourceDataAccess,
      }),
    ).resolves.toEqual(updatedResource);

    expect(resourceDataAccess.updateResource).toHaveBeenCalledWith(
      resource.id,
      {
        title: trimmedTitle,
      },
    );
    expect(mockResolveResourceMetadataForUrl).not.toHaveBeenCalled();
  });

  it("treats empty resource titles as cleared nullable titles", async () => {
    const resource = createResourceFixture();
    const updatedResource = { ...resource, title: null };
    const resourceDataAccess = createUpdateResourceDataAccessFixture({
      findResourceById: jest.fn().mockResolvedValue(resource),
      updateResource: jest.fn().mockResolvedValue(updatedResource),
    });

    await expect(
      updateResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: resource.organizationId,
          title: "",
        },
        userOrganizationId: resource.organizationId,
        resourceDataAccess,
      }),
    ).resolves.toEqual(updatedResource);

    expect(resourceDataAccess.updateResource).toHaveBeenCalledWith(
      resource.id,
      {
        title: null,
      },
    );
    expect(mockResolveResourceMetadataForUrl).not.toHaveBeenCalled();
  });

  it("returns CONFLICT when the resource data access cannot update the resource", async () => {
    const resource = createResourceFixture();
    const resourceDataAccess = createUpdateResourceDataAccessFixture({
      findResourceById: jest.fn().mockResolvedValue(resource),
      updateResource: jest.fn().mockResolvedValue(null),
    });

    await expectOrpcErrorCode(
      updateResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: resource.organizationId,
          title: createResourceName(),
        },
        userOrganizationId: resource.organizationId,
        resourceDataAccess,
      }),
      "CONFLICT",
    );
  });

  it("maps unique URL constraint violations to CONFLICT", async () => {
    const resource = createResourceFixture();
    const uniqueConstraintError = Object.assign(
      new Error("duplicate resource URL"),
      { code: POSTGRES_UNIQUE_CONSTRAINT_VIOLATION_CODE },
    );
    const resourceDataAccess = createUpdateResourceDataAccessFixture({
      findResourceById: jest.fn().mockResolvedValue(resource),
      updateResource: jest.fn().mockRejectedValue(uniqueConstraintError),
    });
    const nextUrl = createResourceUrl();
    mockResolvedResourceMetadata(nextUrl);

    await expectOrpcErrorCode(
      updateResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: resource.organizationId,
          url: nextUrl,
        },
        userOrganizationId: resource.organizationId,
        resourceDataAccess,
      }),
      "CONFLICT",
    );
  });
});
