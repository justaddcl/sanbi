import { createUuid } from "@testUtils/generators/createUuid";
import { createDeleteResourceDataAccessFixture } from "@testUtils/models/resource/deleteResourceDataAccess";
import { createResourceFixture } from "@testUtils/models/resource/fixtures";
import { expectOrpcErrorCode } from "@testUtils/orpc/expectOrpcErrorCode";
import { type MockOrpcErrorModule } from "@testUtils/orpc/mockOrpcError";

import { deleteResourceForOrganization } from "@server/orpc/services/resource/deleteResource";

jest.mock("@orpc/server", () => {
  const { mockOrpcErrorModule } = jest.requireActual<{
    mockOrpcErrorModule: MockOrpcErrorModule;
  }>("@testUtils/orpc/mockOrpcError");

  return mockOrpcErrorModule;
});

describe("deleteResourceForOrganization", () => {
  it("rejects deletes outside of the user's organization before fetching the resource", async () => {
    const resource = createResourceFixture();
    const resourceDataAccess = createDeleteResourceDataAccessFixture();

    await expectOrpcErrorCode(
      deleteResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: createUuid(),
        },
        userOrganizationId: resource.organizationId,
        resourceDataAccess,
      }),
      "FORBIDDEN",
    );

    expect(resourceDataAccess.findResourceById).not.toHaveBeenCalled();
    expect(resourceDataAccess.deleteResource).not.toHaveBeenCalled();
  });

  it("returns NOT_FOUND when the target resource does not exist", async () => {
    const organizationId = createUuid();
    const resourceDataAccess = createDeleteResourceDataAccessFixture({
      findResourceById: jest.fn().mockResolvedValue(null),
    });

    await expectOrpcErrorCode(
      deleteResourceForOrganization({
        input: {
          resourceId: createUuid(),
          organizationId,
        },
        userOrganizationId: organizationId,
        resourceDataAccess,
      }),
      "NOT_FOUND",
    );

    expect(resourceDataAccess.deleteResource).not.toHaveBeenCalled();
  });

  it("rejects resources that belong to another organization", async () => {
    const organizationId = createUuid();
    const resource = createResourceFixture({
      organizationId: createUuid(),
    });
    const resourceDataAccess = createDeleteResourceDataAccessFixture({
      findResourceById: jest.fn().mockResolvedValue(resource),
    });

    await expectOrpcErrorCode(
      deleteResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId,
        },
        userOrganizationId: organizationId,
        resourceDataAccess,
      }),
      "FORBIDDEN",
    );

    expect(resourceDataAccess.deleteResource).not.toHaveBeenCalled();
  });

  it("deletes by resource and organization id", async () => {
    const resource = createResourceFixture();
    const resourceDataAccess = createDeleteResourceDataAccessFixture({
      findResourceById: jest.fn().mockResolvedValue(resource),
      deleteResource: jest.fn().mockResolvedValue(resource),
    });

    await expect(
      deleteResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: resource.organizationId,
        },
        userOrganizationId: resource.organizationId,
        resourceDataAccess,
      }),
    ).resolves.toEqual(resource);

    expect(resourceDataAccess.deleteResource).toHaveBeenCalledWith(
      resource.id,
      resource.organizationId,
    );
  });

  it("returns INTERNAL_SERVER_ERROR when the delete adapter cannot delete the resource", async () => {
    const resource = createResourceFixture();
    const resourceDataAccess = createDeleteResourceDataAccessFixture({
      findResourceById: jest.fn().mockResolvedValue(resource),
      deleteResource: jest.fn().mockResolvedValue(null),
    });

    await expectOrpcErrorCode(
      deleteResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: resource.organizationId,
        },
        userOrganizationId: resource.organizationId,
        resourceDataAccess,
      }),
      "INTERNAL_SERVER_ERROR",
    );
  });
});
