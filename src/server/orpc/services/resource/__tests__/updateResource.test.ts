import {
  POSTGRES_UNIQUE_CONSTRAINT_VIOLATION_CODE,
  updateResourceForOrganization,
} from "@server/orpc/services/resource/updateResource";
import { createUuid } from "@/testUtils/generators/createUuid";
import { createResourceFixture } from "@/testUtils/models/resource/fixtures";
import {
  createResourceName,
  createResourceUrl,
} from "@/testUtils/models/resource/generators";
import { createUpdateResourceDataFixture } from "@/testUtils/models/resource/updateResourceData";
import { expectOrpcErrorCode } from "@/testUtils/orpc/expectOrpcErrorCode";
import { type MockOrpcErrorModule } from "@/testUtils/orpc/mockOrpcError";

jest.mock("@orpc/server", () => {
  const { mockOrpcErrorModule } = jest.requireActual<{
    mockOrpcErrorModule: MockOrpcErrorModule;
  }>("@/testUtils/orpc/mockOrpcError");

  return mockOrpcErrorModule;
});
jest.mock("@orpc/client", () => {
  const { mockOrpcErrorModule } = jest.requireActual<{
    mockOrpcErrorModule: MockOrpcErrorModule;
  }>("@/testUtils/orpc/mockOrpcError");

  return mockOrpcErrorModule;
});

describe("updateResourceForOrganization", () => {
  it("rejects updates outside of the user's organization before fetching the resource", async () => {
    const resource = createResourceFixture();
    const resourceData = createUpdateResourceDataFixture();

    await expectOrpcErrorCode(
      updateResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: createUuid(),
          title: createResourceName(),
        },
        userOrganizationId: resource.organizationId,
        resourceData,
      }),
      "FORBIDDEN",
    );

    expect(resourceData.findResourceById).not.toHaveBeenCalled();
    expect(resourceData.updateResource).not.toHaveBeenCalled();
  });

  it("returns NOT_FOUND when the target resource does not exist", async () => {
    const organizationId = createUuid();
    const resourceData = createUpdateResourceDataFixture({
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
        resourceData,
      }),
      "NOT_FOUND",
    );

    expect(resourceData.updateResource).not.toHaveBeenCalled();
  });

  it("rejects resources that belong to another organization", async () => {
    const organizationId = createUuid();
    const resource = createResourceFixture({
      organizationId: createUuid(),
    });
    const resourceData = createUpdateResourceDataFixture({
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
        resourceData,
      }),
      "FORBIDDEN",
    );

    expect(resourceData.updateResource).not.toHaveBeenCalled();
  });

  it("returns the existing resource without writing when submitted values are unchanged", async () => {
    const resourceUrl = createResourceUrl();
    const resource = createResourceFixture({
      url: resourceUrl,
    });
    const resourceData = createUpdateResourceDataFixture({
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
        resourceData,
      }),
    ).resolves.toEqual(resource);

    expect(resourceData.updateResource).not.toHaveBeenCalled();
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
    const resourceData = createUpdateResourceDataFixture({
      findResourceById: jest.fn().mockResolvedValue(resource),
      updateResource: jest.fn().mockResolvedValue(updatedResource),
    });

    await expect(
      updateResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: resource.organizationId,
          title: updatedResource.title,
          url: `  ${updatedResource.url}  `,
        },
        userOrganizationId: resource.organizationId,
        resourceData,
      }),
    ).resolves.toEqual(updatedResource);

    expect(resourceData.updateResource).toHaveBeenCalledWith(resource.id, {
      title: updatedResource.title,
      url: updatedResource.url,
    });
  });

  it("returns CONFLICT when the resource data access cannot update the resource", async () => {
    const resource = createResourceFixture();
    const resourceData = createUpdateResourceDataFixture({
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
        resourceData,
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
    const resourceData = createUpdateResourceDataFixture({
      findResourceById: jest.fn().mockResolvedValue(resource),
      updateResource: jest.fn().mockRejectedValue(uniqueConstraintError),
    });

    await expectOrpcErrorCode(
      updateResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: resource.organizationId,
          url: createResourceUrl(),
        },
        userOrganizationId: resource.organizationId,
        resourceData,
      }),
      "CONFLICT",
    );
  });
});
