import { act, renderHook, waitFor } from "@testing-library/react";
import { createUuid } from "@testUtils/generators/createUuid";
import { createResourceFixture } from "@testUtils/models/resource/fixtures";
import {
  createResourceName,
  createResourceUrl,
} from "@testUtils/models/resource/generators";
import {
  createOrganizationMembershipFixture,
  createUserWithMembershipsFixture,
} from "@testUtils/models/user/fixtures";
import { toast } from "sonner";

import type { Resource, UserWithMemberships } from "@lib/types";

import { useResourceFormController } from "../useResourceFormController";

const mockCreateResource = jest.fn<Promise<Resource>, [unknown]>();
const mockUpdateResource = jest.fn<Promise<Resource>, [unknown]>();
const mockPreviewMetadata = jest.fn<Promise<unknown>, [unknown]>();
const mockInvalidateResources = jest.fn();
let mockUserData: NonNullable<UserWithMemberships>;

jest.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ userId: "user_123" }),
}));

jest.mock("usehooks-ts", () => ({
  useDebounceValue: (value: string) => [value],
}));

jest.mock("@lib/trpc", () => ({
  trpc: {
    resource: {
      create: {
        useMutation: jest.fn(() => ({
          mutateAsync: mockCreateResource,
        })),
      },
      update: {
        useMutation: jest.fn(() => ({
          mutateAsync: mockUpdateResource,
        })),
      },
      previewMetadata: {
        useMutation: jest.fn(() => ({
          mutateAsync: mockPreviewMetadata,
          isPending: false,
        })),
      },
    },
    user: {
      getUser: {
        useQuery: jest.fn(() => ({ data: mockUserData })),
      },
    },
    useUtils: jest.fn(() => ({
      resource: {
        getBySongId: {
          invalidate: mockInvalidateResources,
        },
      },
    })),
  },
}));

jest.mock("sonner", () => ({
  toast: {
    loading: jest.fn(() => "toast-id"),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}));

const songId = createUuid();
const organizationId = createUuid();

const createUserDataFixture = (overrides: Partial<typeof mockUserData> = {}) =>
  createUserWithMembershipsFixture({
    memberships: [
      createOrganizationMembershipFixture({
        organizationId,
      }),
    ],
    ...overrides,
  });

describe("useResourceFormController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserData = createUserDataFixture();
    mockCreateResource.mockResolvedValue(
      createResourceFixture({ songId, organizationId }),
    );
    mockUpdateResource.mockResolvedValue(
      createResourceFixture({ songId, organizationId }),
    );
    mockPreviewMetadata.mockResolvedValue(null);
    mockInvalidateResources.mockResolvedValue(undefined);
  });

  it("creates a resource for the requested organization and invalidates the song resources", async () => {
    const resourceName = createResourceName();
    const resourceUrl = createResourceUrl();
    const onSuccess = jest.fn();
    const { result } = renderHook(() =>
      useResourceFormController({
        mode: "create",
        songId,
        organizationId,
        onSuccess,
      }),
    );

    await act(async () => {
      await result.current.handleSubmit({
        title: resourceName,
        url: resourceUrl,
      });
    });

    expect(mockCreateResource).toHaveBeenCalledWith({
      songId,
      organizationId,
      title: resourceName,
      url: resourceUrl,
    });
    expect(mockInvalidateResources).toHaveBeenCalledWith({
      songId,
      organizationId,
    });
    expect(toast.success).toHaveBeenCalledWith("Resource was linked", {
      id: "toast-id",
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("updates an existing resource with its organization membership", async () => {
    const resource = createResourceFixture({ songId, organizationId });
    const resourceName = createResourceName();
    const resourceUrl = createResourceUrl();
    const onSuccess = jest.fn();
    const { result } = renderHook(() =>
      useResourceFormController({
        mode: "edit",
        resource,
        onSuccess,
      }),
    );

    await act(async () => {
      await result.current.handleSubmit({
        title: resourceName,
        url: resourceUrl,
      });
    });

    expect(mockUpdateResource).toHaveBeenCalledWith({
      resourceId: resource.id,
      organizationId,
      title: resourceName,
      url: resourceUrl,
    });
    expect(mockInvalidateResources).toHaveBeenCalledWith({
      songId,
      organizationId,
    });
    expect(toast.success).toHaveBeenCalledWith("Resource was updated", {
      id: "toast-id",
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("rejects submission when the user is not a member of the resource organization", async () => {
    mockUserData = createUserDataFixture({
      memberships: [
        createOrganizationMembershipFixture({
          organizationId: createUuid(),
        }),
      ],
    });
    const onSuccess = jest.fn();
    const { result } = renderHook(() =>
      useResourceFormController({
        mode: "create",
        songId,
        organizationId,
        onSuccess,
      }),
    );

    await act(async () => {
      await result.current.handleSubmit({
        title: createResourceName(),
        url: createResourceUrl(),
      });
    });

    expect(mockCreateResource).not.toHaveBeenCalled();
    expect(mockUpdateResource).not.toHaveBeenCalled();
    expect(mockInvalidateResources).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      "Could not link resource: invalid team membership",
      { id: "toast-id" },
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("suggests and clears generated names from preview metadata", async () => {
    const resourceUrl = createResourceUrl();
    const suggestedResourceName = createResourceName();
    mockPreviewMetadata.mockResolvedValue({
      normalizedUrl: resourceUrl,
      status: "ready",
      title: suggestedResourceName,
      description: null,
      faviconUrl: null,
      imageUrl: null,
      lastFetchedAt: new Date(),
    });
    const { result } = renderHook(() =>
      useResourceFormController({
        mode: "create",
        songId,
        organizationId,
        onSuccess: jest.fn(),
      }),
    );

    act(() => {
      result.current.form.setValue("url", resourceUrl);
    });

    await waitFor(() => {
      expect(mockPreviewMetadata).toHaveBeenCalledWith({
        organizationId,
        url: resourceUrl,
      });
    });
    await waitFor(() => {
      expect(result.current.form.getValues("title")).toBe(
        suggestedResourceName,
      );
    });
    expect(result.current.autoTitle.isNameAutoGenerated).toBe(true);

    act(() => {
      result.current.autoTitle.clearAutoGeneratedTitle();
      result.current.form.setValue("title", "Custom resource name");
    });

    expect(result.current.autoTitle.isNameAutoGenerated).toBe(false);
  });
});
