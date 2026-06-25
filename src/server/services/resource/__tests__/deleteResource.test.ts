import { createUuid } from "@testUtils/generators/createUuid";
import { createDeleteResourceDataAccessFixture } from "@testUtils/models/resource/deleteResourceDataAccess";
import { expectTRPCErrorCode } from "@testUtils/models/resource/expectTRPCErrorCode";
import { createResourceFixture } from "@testUtils/models/resource/fixtures";

import { deleteResourceForOrganization } from "@server/services/resource/deleteResource";

describe("deleteResourceForOrganization", () => {
  it("rejects deletes outside of the user's organization before fetching the resource", async () => {
    const resource = createResourceFixture();
    const resourceDataAccess = createDeleteResourceDataAccessFixture();

    await expectTRPCErrorCode(
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

    await expectTRPCErrorCode(
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

    await expectTRPCErrorCode(
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

    await expectTRPCErrorCode(
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
