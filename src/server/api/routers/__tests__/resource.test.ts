import { createUserFixture } from "@testUtils/fixtures/users";
import { createUuid } from "@testUtils/generators/createUuid";
import { createResourceFixture } from "@testUtils/models/resource/fixtures";
import {
  createResourceName,
  createResourceUrl,
} from "@testUtils/models/resource/generators";
import { createOrganizationMembershipFixture } from "@testUtils/models/user/fixtures";
import { TRPCError } from "@trpc/server";

import { resourceRouter } from "@server/api/routers/resource";
import { resources } from "@server/db/schema";
import {
  fetchResourcePreviewMetadata,
  resolveResourceMetadataForUrl,
} from "@server/services/resource/resourceMetadata";

jest.mock("@/server/db", () => ({
  db: {
    query: {
      users: {
        findFirst: jest.fn(),
      },
      organizations: {
        findFirst: jest.fn(),
      },
      organizationMemberships: {
        findFirst: jest.fn(),
      },
      songs: {
        findFirst: jest.fn(),
      },
      resources: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    },
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(() => ({ userId: "user_123" })),
}));
jest.mock("superjson", () => ({
  __esModule: true,
  default: {},
}));
jest.mock("@server/services/resource/resourceMetadata", () => ({
  fetchResourcePreviewMetadata: jest.fn(),
  resolveResourceMetadataForUrl: jest.fn(),
  toResourceMetadataWriteValues: jest.fn(
    (previewMetadata: {
      status: "ready" | "failed";
      title: string | null;
      description: string | null;
      faviconUrl: string | null;
      imageUrl: string | null;
      lastFetchedAt: Date;
    }) => ({
    status: previewMetadata.status,
    metaTitle: previewMetadata.title,
    metaDescription: previewMetadata.description,
    faviconUrl: previewMetadata.faviconUrl,
    imageUrl: previewMetadata.imageUrl,
    lastFetchedAt: previewMetadata.lastFetchedAt,
  }),
  ),
}));

type MockResourceRouterDb = {
  query: {
    users: { findFirst: jest.Mock };
    organizations: { findFirst: jest.Mock };
    organizationMemberships: { findFirst: jest.Mock };
    songs: { findFirst: jest.Mock };
    resources: { findFirst: jest.Mock; findMany: jest.Mock };
  };
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};
const mockedServerDb: { db: MockResourceRouterDb } =
  jest.requireMock("@/server/db");
const mockDb = mockedServerDb.db;

const userId = "user_123";
const organizationId = createUuid();
const membership = createOrganizationMembershipFixture({
  userId,
  organizationId,
});
const organization = membership.organization;
const user = createUserFixture({
  id: userId,
});

const createCaller = () =>
  resourceRouter.createCaller({
    auth: { userId },
    db: mockDb,
    headers: new Headers(),
  } as never);

const mockInsertReturning = (value: unknown) => {
  const returning = jest.fn().mockResolvedValue(value);
  const onConflictDoNothing = jest.fn(() => ({ returning }));
  const values = jest.fn(() => ({ onConflictDoNothing }));

  mockDb.insert.mockReturnValue({ values });

  return { values, onConflictDoNothing, returning };
};

const mockUpdateReturning = (value: unknown) => {
  const returning = jest.fn().mockResolvedValue(value);
  const where = jest.fn(() => ({ returning }));
  const set = jest.fn(() => ({ where }));

  mockDb.update.mockReturnValue({ set });

  return { set, where, returning };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.query.users.findFirst.mockResolvedValue(user);
  mockDb.query.organizations.findFirst.mockResolvedValue(organization);
  mockDb.query.organizationMemberships.findFirst.mockResolvedValue(membership);
});

describe("resourceRouter", () => {
  it("lists resources for songs in the authenticated organization", async () => {
    const resource = createResourceFixture({ organizationId });
    mockDb.query.songs.findFirst.mockResolvedValue({
      id: resource.songId,
      organizationId,
    });
    mockDb.query.resources.findMany.mockResolvedValue([resource]);

    await expect(
      createCaller().getBySongId({
        songId: resource.songId,
        organizationId,
      }),
    ).resolves.toEqual([resource]);
  });

  it("rejects cross-organization song resource lists", async () => {
    mockDb.query.songs.findFirst.mockResolvedValue({
      id: createUuid(),
      organizationId: createUuid(),
    });

    await expect(
      createCaller().getBySongId({
        songId: createUuid(),
        organizationId,
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("rejects missing songs before listing resources", async () => {
    mockDb.query.songs.findFirst.mockResolvedValue(null);

    await expect(
      createCaller().getBySongId({
        songId: createUuid(),
        organizationId,
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    expect(mockDb.query.resources.findMany).not.toHaveBeenCalled();
  });

  it("previews resource metadata through the tRPC boundary", async () => {
    const url = createResourceUrl();
    const previewMetadata = {
      normalizedUrl: url,
      status: "ready" as const,
      title: createResourceName(),
      description: null,
      faviconUrl: null,
      imageUrl: null,
      lastFetchedAt: new Date("2026-01-01T00:00:00Z"),
    };
    jest.mocked(fetchResourcePreviewMetadata).mockResolvedValue(
      previewMetadata,
    );

    await expect(
      createCaller().previewMetadata({
        organizationId,
        url,
      }),
    ).resolves.toEqual(previewMetadata);
  });

  it("creates resources with resolved metadata and maps URL conflicts", async () => {
    const resource = createResourceFixture({ organizationId });
    jest.mocked(resolveResourceMetadataForUrl).mockResolvedValue({
      normalizedUrl: resource.url,
      metadataValues: {
        status: "ready",
        metaTitle: "Fetched title",
        metaDescription: null,
        faviconUrl: null,
        imageUrl: null,
        lastFetchedAt: new Date("2026-01-01T00:00:00Z"),
      },
    });
    mockDb.query.songs.findFirst.mockResolvedValue({
      id: resource.songId,
      organizationId,
    });
    const insert = mockInsertReturning([]);

    await expect(
      createCaller().create({
        songId: resource.songId,
        organizationId,
        title: resource.title,
        url: resource.url,
      }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
    });
    expect(mockDb.insert).toHaveBeenCalledWith(resources);
    expect(insert.values).toHaveBeenCalledWith(
      expect.objectContaining({
        songId: resource.songId,
        organizationId,
        url: resource.url,
        status: "ready",
        metaTitle: "Fetched title",
      }),
    );
  });

  it("rejects invalid resource input before calling data access", async () => {
    await expect(
      createCaller().create({
        songId: createUuid(),
        organizationId,
        title: createResourceName(),
        url: "http://example.com/not-secure",
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    expect(mockDb.query.songs.findFirst).not.toHaveBeenCalled();
  });

  it("maps URL validator failures from metadata resolution to bad requests", async () => {
    const resource = createResourceFixture({ organizationId });
    mockDb.query.songs.findFirst.mockResolvedValue({
      id: resource.songId,
      organizationId,
    });
    jest
      .mocked(resolveResourceMetadataForUrl)
      .mockRejectedValue(
        new TRPCError({
          code: "BAD_REQUEST",
          message: "URL contains port",
        }),
      );

    await expect(
      createCaller().create({
        songId: resource.songId,
        organizationId,
        title: resource.title,
        url: "https://example.com:8443/chords",
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "URL contains port",
    });
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("updates resources through the service boundary", async () => {
    const resource = createResourceFixture({ organizationId });
    const updatedResource = {
      ...resource,
      title: createResourceName(),
    };
    mockDb.query.resources.findFirst.mockResolvedValue(resource);
    const update = mockUpdateReturning([updatedResource]);

    await expect(
      createCaller().update({
        resourceId: resource.id,
        organizationId,
        title: updatedResource.title,
      }),
    ).resolves.toEqual(updatedResource);
    expect(update.set).toHaveBeenCalledWith({
      title: updatedResource.title,
    });
  });

  it("refreshes metadata through the service boundary", async () => {
    const resource = createResourceFixture({ organizationId });
    const refreshedResource = {
      ...resource,
      status: "ready" as const,
      metaTitle: "Refreshed title",
      lastFetchedAt: new Date("2026-01-01T00:00:00Z"),
    };
    mockDb.query.resources.findFirst.mockResolvedValue(resource);
    jest.mocked(fetchResourcePreviewMetadata).mockResolvedValue({
      normalizedUrl: resource.url,
      status: "ready",
      title: refreshedResource.metaTitle,
      description: null,
      faviconUrl: null,
      imageUrl: null,
      lastFetchedAt: refreshedResource.lastFetchedAt,
    });
    const update = mockUpdateReturning([refreshedResource]);

    await expect(
      createCaller().refreshMetadata({
        resourceId: resource.id,
        organizationId,
      }),
    ).resolves.toEqual(refreshedResource);
    expect(update.set).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "ready",
        metaTitle: refreshedResource.metaTitle,
      }),
    );
  });
});
