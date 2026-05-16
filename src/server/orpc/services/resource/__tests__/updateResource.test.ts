import { ORPCError } from "@orpc/server";

import {
  updateResourceForOrganization,
  type UpdateResourceRepository,
} from "@server/orpc/services/resource/updateResource";
import { createUuid } from "@/testUtils/generators/createUuid";
import { createResourceFixture } from "@/testUtils/models/resource/fixtures";
import { createResourceName } from "@/testUtils/models/resource/generators";

jest.mock("@orpc/server", () => {
  interface ORPCErrorOptions {
    message?: string;
    cause?: unknown;
  }

  class ORPCError extends Error {
    public readonly code: string;

    constructor(code: string, ...rest: [ORPCErrorOptions] | []) {
      const opts = rest[0] ?? {};
      super(opts.message ?? `Mock ORPCError with code ${code}`);
      this.name = "ORPCError";
      this.code = code;
      this.cause = opts.cause;
    }
  }

  return { __esModule: true, ORPCError };
});

jest.mock("@orpc/client", () => {
  interface ORPCErrorOptions {
    message?: string;
    cause?: unknown;
  }

  class ORPCError extends Error {
    public readonly code: string;

    constructor(code: string, ...rest: [ORPCErrorOptions] | []) {
      const opts = rest[0] ?? {};
      super(opts.message ?? `Mock ORPCError with code ${code}`);
      this.name = "ORPCError";
      this.code = code;
      this.cause = opts.cause;
    }
  }

  return { __esModule: true, ORPCError };
});

type MockUpdateResourceRepository = {
  findResourceById: jest.MockedFunction<
    UpdateResourceRepository["findResourceById"]
  >;
  updateResource: jest.MockedFunction<UpdateResourceRepository["updateResource"]>;
};

const createRepositoryFixture = (
  overrides: Partial<MockUpdateResourceRepository> = {},
): MockUpdateResourceRepository => ({
  findResourceById: jest.fn(),
  updateResource: jest.fn(),
  ...overrides,
});

const expectOrpcErrorCode = async (
  action: Promise<unknown>,
  code: string,
) => {
  await expect(action).rejects.toBeInstanceOf(ORPCError);
  await expect(action).rejects.toMatchObject({ code });
};

describe("updateResourceForOrganization", () => {
  it("rejects updates outside of the user's organization before fetching the resource", async () => {
    const resource = createResourceFixture();
    const repository = createRepositoryFixture();

    await expectOrpcErrorCode(
      updateResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: createUuid(),
          title: createResourceName(),
        },
        userOrganizationId: resource.organizationId,
        repository,
      }),
      "FORBIDDEN",
    );

    expect(repository.findResourceById).not.toHaveBeenCalled();
    expect(repository.updateResource).not.toHaveBeenCalled();
  });

  it("returns NOT_FOUND when the target resource does not exist", async () => {
    const organizationId = createUuid();
    const repository = createRepositoryFixture({
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
        repository,
      }),
      "NOT_FOUND",
    );

    expect(repository.updateResource).not.toHaveBeenCalled();
  });

  it("rejects resources that belong to another organization", async () => {
    const organizationId = createUuid();
    const resource = createResourceFixture({
      organizationId: createUuid(),
    });
    const repository = createRepositoryFixture({
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
        repository,
      }),
      "FORBIDDEN",
    );

    expect(repository.updateResource).not.toHaveBeenCalled();
  });

  it("returns the existing resource without writing when submitted values are unchanged", async () => {
    const resource = createResourceFixture({
      url: "https://example.com/chart",
    });
    const repository = createRepositoryFixture({
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
        repository,
      }),
    ).resolves.toEqual(resource);

    expect(repository.updateResource).not.toHaveBeenCalled();
  });

  it("updates changed fields and normalizes URLs before writing", async () => {
    const resource = createResourceFixture({
      url: "https://example.com/original",
    });
    const updatedResource = {
      ...resource,
      title: createResourceName(),
      url: "https://example.com/chart",
    };
    const repository = createRepositoryFixture({
      findResourceById: jest.fn().mockResolvedValue(resource),
      updateResource: jest.fn().mockResolvedValue(updatedResource),
    });

    await expect(
      updateResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: resource.organizationId,
          title: updatedResource.title,
          url: "  https://EXAMPLE.com//chart  ",
        },
        userOrganizationId: resource.organizationId,
        repository,
      }),
    ).resolves.toEqual(updatedResource);

    expect(repository.updateResource).toHaveBeenCalledWith(resource.id, {
      title: updatedResource.title,
      url: updatedResource.url,
    });
  });

  it("returns CONFLICT when the repository cannot update the resource", async () => {
    const resource = createResourceFixture();
    const repository = createRepositoryFixture({
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
        repository,
      }),
      "CONFLICT",
    );
  });

  it("maps unique URL constraint violations to CONFLICT", async () => {
    const resource = createResourceFixture();
    const uniqueConstraintError = Object.assign(
      new Error("duplicate resource URL"),
      { code: "23505" },
    );
    const repository = createRepositoryFixture({
      findResourceById: jest.fn().mockResolvedValue(resource),
      updateResource: jest.fn().mockRejectedValue(uniqueConstraintError),
    });

    await expectOrpcErrorCode(
      updateResourceForOrganization({
        input: {
          resourceId: resource.id,
          organizationId: resource.organizationId,
          url: "https://example.com/duplicate",
        },
        userOrganizationId: resource.organizationId,
        repository,
      }),
      "CONFLICT",
    );
  });
});
