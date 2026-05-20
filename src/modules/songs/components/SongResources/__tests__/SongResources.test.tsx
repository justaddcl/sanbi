import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createUuid } from "@testUtils/generators/createUuid";
import { createResourceFixture } from "@testUtils/models/resource/fixtures";
import {
  createResourceName,
  createResourceUrl,
} from "@testUtils/models/resource/generators";
import {
  createOrganizationMembershipFixture,
  createUserPreferencesFixture,
  createUserWithMembershipsFixture,
} from "@testUtils/models/user/fixtures";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";

import { useSongResources } from "@modules/songs/queries/useSongResources";
import { getDisplayUrl } from "@modules/songs/utils/getDisplayUrl";
import { getResourceDisplayTitle } from "@modules/songs/utils/getResourceDisplayTitle";
import { type Resource, type UserWithMemberships } from "@lib/types";

import { SongResources } from "../SongResources";

const mockCreateResource = jest.fn<Promise<Resource>, [unknown]>();
const mockUpdateResource = jest.fn<Promise<Resource>, [unknown]>();
const mockDeleteResource = jest.fn<Promise<Resource>, [unknown]>();
const mockRefreshResourceMetadata = jest.fn<Promise<Resource>, [unknown]>();
const mockPreviewMetadata = jest.fn<Promise<unknown>, [unknown]>();
const mockUpdateResourceDeleteConfirmationPreference = jest.fn<
  Promise<unknown>,
  [unknown]
>();
const mockInvalidateUser = jest.fn();
let mockUserData: NonNullable<UserWithMemberships>;

jest.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ userId: "user_123" }),
}));

jest.mock("usehooks-ts", () => ({
  useMediaQuery: jest.fn(),
  useDebounceValue: (value: string) => [value],
}));

jest.mock(
  "@lib/trpc",
  () => ({
    trpc: {
      user: {
        getUser: {
          useQuery: jest.fn(() => ({ data: mockUserData })),
        },
        updateResourceDeleteConfirmationPreference: {
          useMutation: jest.fn(() => ({
            mutateAsync: mockUpdateResourceDeleteConfirmationPreference,
          })),
        },
      },
      useUtils: jest.fn(() => ({
        user: {
          getUser: {
            invalidate: mockInvalidateUser,
          },
        },
      })),
    },
  }),
  { virtual: true },
);

jest.mock(
  "@lib/orpc/client",
  () => ({
    orpc: {
      resource: {
        create: {
          mutationOptions: () => ({
            mutationFn: mockCreateResource,
          }),
        },
        update: {
          mutationOptions: () => ({
            mutationFn: mockUpdateResource,
          }),
        },
        delete: {
          mutationOptions: () => ({
            mutationFn: mockDeleteResource,
          }),
        },
        refreshMetadata: {
          mutationOptions: () => ({
            mutationFn: mockRefreshResourceMetadata,
          }),
        },
        previewMetadata: {
          queryOptions: ({ input }: { input: unknown }) => ({
            queryKey: ["orpc", "resource", "previewMetadata", input],
            queryFn: () => mockPreviewMetadata(input),
          }),
        },
        getBySongId: {
          queryOptions: ({ input }: { input: unknown }) => ({
            queryKey: ["orpc", "resource", "getBySongId", input],
          }),
        },
      },
    },
  }),
  { virtual: true },
);

jest.mock("@modules/songs/queries/useSongResources", () => ({
  useSongResources: jest.fn(),
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
  captureMessage: jest.fn(),
}));

const songId = createUuid();
const organizationId = createUuid();
const songName = createResourceName();

const createUserDataFixture = (overrides: Partial<typeof mockUserData> = {}) =>
  createUserWithMembershipsFixture({
    memberships: [
      createOrganizationMembershipFixture({
        organizationId,
      }),
    ],
    ...overrides,
  });

const createSongResourcesQueryFixture = (
  overrides: Partial<{
    data: Resource[];
    isLoading: boolean;
    error: Error | null;
  }> = {},
) => ({
  data: [resource],
  isLoading: false,
  error: null,
  ...overrides,
});

const resource = createResourceFixture({
  songId,
  organizationId,
});
const resourceDisplayTitle = getResourceDisplayTitle(resource);

const renderSongResources = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

  render(
    <QueryClientProvider client={queryClient}>
      <SongResources
        songId={songId}
        songName={songName}
        organizationId={organizationId}
      />
    </QueryClientProvider>,
  );

  return { invalidateQueriesSpy };
};

const openEditDrawer = async () => {
  fireEvent.keyDown(
    screen.getByRole("button", {
      name: `Open actions for ${resourceDisplayTitle}`,
    }),
    { key: "Enter", code: "Enter" },
  );

  fireEvent.click(await screen.findByText("Edit resource"));

  return screen.findByRole("dialog");
};

const openCreateDrawer = async () => {
  fireEvent.click(screen.getByRole("button", { name: /link resource/i }));

  return screen.findByRole("dialog");
};

const expectResourceFieldsToBeUrlThenName = () => {
  const resourceFields = screen.getAllByRole("textbox");

  expect(resourceFields).toHaveLength(2);
  expect(resourceFields[0]).toHaveAccessibleName("URL *");
  expect(resourceFields[1]).toHaveAccessibleName("Name");
};

describe("SongResources resource editing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.replaceState(null, "", "/songs/test-song");
    (useMediaQuery as jest.Mock).mockImplementation((query: string) =>
      query.includes("min-width"),
    );
    mockUserData = createUserDataFixture();
    mockCreateResource.mockResolvedValue(resource);
    mockUpdateResource.mockResolvedValue(resource);
    mockDeleteResource.mockResolvedValue(resource);
    mockRefreshResourceMetadata.mockResolvedValue(resource);
    mockPreviewMetadata.mockResolvedValue(null);
    mockUpdateResourceDeleteConfirmationPreference.mockResolvedValue(
      createUserPreferencesFixture({ confirmResourceDelete: false }),
    );
    mockInvalidateUser.mockResolvedValue(undefined);
    (useSongResources as jest.Mock).mockReturnValue(
      createSongResourcesQueryFixture(),
    );
  });

  it("opens a focused edit drawer with prefilled fields", async () => {
    renderSongResources();

    expect(useSongResources).toHaveBeenCalledWith(songId, organizationId);

    await openEditDrawer();

    expect(
      screen.getByRole("heading", { name: "Edit resource" }),
    ).toBeInTheDocument();
    expectResourceFieldsToBeUrlThenName();
    expect(screen.getByLabelText("Name")).toHaveValue(resourceDisplayTitle);
    expect(screen.getByLabelText("URL *")).toHaveValue(resource.url);
    expect(screen.getAllByText(resourceDisplayTitle).length).toBeGreaterThan(1);
    expect(
      screen.getAllByText(getDisplayUrl(resource.url)).length,
    ).toBeGreaterThan(1);
  });

  it("updates the drawer preview from local form edits without changing the list card", async () => {
    const updatedResourceName = createResourceName();
    const updatedResourceUrl = createResourceUrl();

    renderSongResources();

    await openEditDrawer();

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: updatedResourceName },
    });
    fireEvent.change(screen.getByLabelText("URL *"), {
      target: { value: updatedResourceUrl },
    });

    expect(await screen.findByText(updatedResourceName)).toBeInTheDocument();
    expect(
      await screen.findByText(getDisplayUrl(updatedResourceUrl)),
    ).toBeInTheDocument();
    expect(screen.getAllByText(resourceDisplayTitle).length).toBeGreaterThan(0);
  });

  it("renders the empty resource state", () => {
    (useSongResources as jest.Mock).mockReturnValue(
      createSongResourcesQueryFixture({ data: [] }),
    );

    renderSongResources();

    expect(
      screen.getByRole("heading", { name: "No resources yet" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Link chord charts, audio recordings, YouTube videos, Spotify tracks, and more.",
      ),
    ).toBeInTheDocument();
  });

  it("opens the create resource dialog from the empty-state CTA", async () => {
    (useSongResources as jest.Mock).mockReturnValue(
      createSongResourcesQueryFixture({ data: [] }),
    );

    renderSongResources();

    fireEvent.click(screen.getByRole("button", { name: "Link a resource" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Link a song resource" }),
    ).toBeInTheDocument();
    expectResourceFieldsToBeUrlThenName();
  });

  it("closes without submitting when cancelled", async () => {
    renderSongResources();

    await openEditDrawer();

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Cancelled Resource" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockUpdateResource).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("link", {
        name: (accessibleName) => accessibleName.includes(resourceDisplayTitle),
      }),
    ).toBeInTheDocument();
  });

  it("creates resources for the explicit organization instead of the first membership", async () => {
    const newResourceName = createResourceName();
    const newResourceUrl = createResourceUrl();
    const firstMembershipOrganizationId = createUuid();

    mockUserData = createUserDataFixture({
      memberships: [
        createOrganizationMembershipFixture({
          organizationId: firstMembershipOrganizationId,
        }),
        createOrganizationMembershipFixture({
          organizationId,
        }),
      ],
    });
    const { invalidateQueriesSpy } = renderSongResources();

    await openCreateDrawer();

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: newResourceName },
    });
    fireEvent.blur(screen.getByLabelText("Name"));
    fireEvent.change(screen.getByLabelText("URL *"), {
      target: { value: newResourceUrl },
    });
    fireEvent.blur(screen.getByLabelText("URL *"));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Link resource" }),
      ).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Link resource" }));

    await waitFor(() => {
      expect(mockCreateResource).toHaveBeenCalled();
    });
    expect(mockCreateResource.mock.calls[0]?.[0]).toEqual({
      songId,
      organizationId,
      title: newResourceName,
      url: newResourceUrl,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [
        "orpc",
        "resource",
        "getBySongId",
        {
          songId,
          organizationId,
        },
      ],
    });
  });

  it("suggests the resource name from fetched page metadata", async () => {
    const newResourceUrl = createResourceUrl();
    const suggestedResourceName = createResourceName();

    mockPreviewMetadata.mockResolvedValue({
      normalizedUrl: newResourceUrl,
      status: "ready",
      title: suggestedResourceName,
      description: null,
      faviconUrl: null,
      imageUrl: null,
      lastFetchedAt: new Date(),
    });
    renderSongResources();

    await openCreateDrawer();

    fireEvent.change(screen.getByLabelText("URL *"), {
      target: { value: newResourceUrl },
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toHaveValue(suggestedResourceName);
    });
    expect(
      screen.getByText(
        "Suggested from the page title, but feel free to rename it.",
      ),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Custom resource name" },
    });

    expect(
      screen.queryByText(
        "Suggested from the page title, but feel free to rename it.",
      ),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "" },
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toHaveValue(suggestedResourceName);
    });

    fireEvent.change(screen.getByLabelText("URL *"), {
      target: { value: "" },
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toHaveValue("");
    });
    expect(
      screen.queryByText(
        "Suggested from the page title, but feel free to rename it.",
      ),
    ).not.toBeInTheDocument();
  });

  it("does not show required field errors when empty fields lose focus", async () => {
    renderSongResources();

    await openCreateDrawer();

    fireEvent.blur(screen.getByLabelText("URL *"));
    fireEvent.blur(screen.getByLabelText("Name"));

    expect(
      screen.queryByText("Please enter a resource URL"),
    ).not.toBeInTheDocument();
  });

  it("shows required field errors when submitting an empty resource form", async () => {
    const newResourceName = createResourceName();
    const newResourceUrl = createResourceUrl();

    renderSongResources();

    await openCreateDrawer();

    fireEvent.click(screen.getByRole("button", { name: "Link resource" }));

    expect(
      await screen.findByText("Please enter a resource URL"),
    ).toBeInTheDocument();
    expect(mockCreateResource).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("URL *"), {
      target: { value: newResourceUrl },
    });
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: newResourceName },
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Link resource" }),
      ).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Link resource" }));

    await waitFor(() => {
      expect(mockCreateResource).toHaveBeenCalled();
    });
  });

  it("warns when a resource URL does not start with https://", async () => {
    const validResourceName = createResourceName();
    const insecureResourceUrl = createResourceUrl().replace(/^https:/, "http:");

    renderSongResources();

    await openCreateDrawer();

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: validResourceName },
    });
    fireEvent.blur(screen.getByLabelText("Name"));

    fireEvent.change(screen.getByLabelText("URL *"), {
      target: { value: insecureResourceUrl },
    });
    fireEvent.blur(screen.getByLabelText("URL *"));

    expect(
      await screen.findByText("Please use a link starting with https://"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Link resource" }),
    ).toBeDisabled();

    fireEvent.change(screen.getByLabelText("URL *"), {
      target: { value: "" },
    });
    fireEvent.blur(screen.getByLabelText("URL *"));

    await waitFor(() => {
      expect(
        screen.queryByText("Please use a link starting with https://"),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.queryByText("Please enter a resource URL"),
    ).not.toBeInTheDocument();
  });

  it("treats a whitespace-only resource URL as missing on submit", async () => {
    const validResourceName = createResourceName();

    renderSongResources();

    await openCreateDrawer();

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: validResourceName },
    });
    fireEvent.change(screen.getByLabelText("URL *"), {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByRole("button", { name: "Link resource" }));

    expect(
      await screen.findByText("Please enter a resource URL"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Please use a link starting with https://"),
    ).not.toBeInTheDocument();
    expect(mockCreateResource).not.toHaveBeenCalled();
  });

  it("keeps edit submission disabled until the resource changes", async () => {
    renderSongResources();

    await openEditDrawer();

    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: createResourceName() },
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Save changes" }),
      ).toBeEnabled();
    });
  });

  it("submits updated resource values and invalidates the song resources query", async () => {
    const updatedResourceName = createResourceName();
    const updatedResourceUrl = createResourceUrl();

    const { invalidateQueriesSpy } = renderSongResources();

    await openEditDrawer();

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: updatedResourceName },
    });
    fireEvent.blur(screen.getByLabelText("Name"));
    fireEvent.change(screen.getByLabelText("URL *"), {
      target: { value: updatedResourceUrl },
    });
    fireEvent.blur(screen.getByLabelText("URL *"));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Save changes" }),
      ).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockUpdateResource).toHaveBeenCalled();
    });

    expect(mockUpdateResource.mock.calls[0]?.[0]).toEqual({
      resourceId: resource.id,
      organizationId,
      title: updatedResourceName,
      url: updatedResourceUrl,
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [
        "orpc",
        "resource",
        "getBySongId",
        {
          songId,
          organizationId,
        },
      ],
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("uses the edited resource organization when the first membership differs", async () => {
    const updatedResourceName = createResourceName();
    const firstMembershipOrganizationId = createUuid();

    mockUserData = createUserDataFixture({
      memberships: [
        createOrganizationMembershipFixture({
          organizationId: firstMembershipOrganizationId,
        }),
        createOrganizationMembershipFixture({
          organizationId,
        }),
      ],
    });
    const { invalidateQueriesSpy } = renderSongResources();

    await openEditDrawer();

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: updatedResourceName },
    });
    fireEvent.blur(screen.getByLabelText("Name"));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Save changes" }),
      ).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockUpdateResource).toHaveBeenCalled();
    });
    expect(mockUpdateResource.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        organizationId,
      }),
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [
        "orpc",
        "resource",
        "getBySongId",
        {
          songId,
          organizationId,
        },
      ],
    });
  });

  it("refreshes preview metadata from the resource action menu", async () => {
    const { invalidateQueriesSpy } = renderSongResources();

    fireEvent.keyDown(
      screen.getByRole("button", {
        name: `Open actions for ${resourceDisplayTitle}`,
      }),
      { key: "Enter", code: "Enter" },
    );
    fireEvent.click(await screen.findByText("Refresh preview"));

    await waitFor(() => {
      expect(mockRefreshResourceMetadata).toHaveBeenCalled();
    });
    expect(mockRefreshResourceMetadata.mock.calls[0]?.[0]).toEqual({
      resourceId: resource.id,
      organizationId,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [
        "orpc",
        "resource",
        "getBySongId",
        {
          songId,
          organizationId,
        },
      ],
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Resource preview was refreshed",
      { id: "toast-id" },
    );
  });

  it("opens the confirmation dialog from the unlink resource action", async () => {
    renderSongResources();

    fireEvent.keyDown(
      screen.getByRole("button", {
        name: `Open actions for ${resourceDisplayTitle}`,
      }),
      { key: "Enter", code: "Enter" },
    );

    const unlinkAction = await screen.findByText("Unlink resource");
    fireEvent.click(unlinkAction);

    expect(
      await screen.findByRole("heading", {
        name: `Unlink ${resourceDisplayTitle}`,
      }),
    ).toBeInTheDocument();
  });

  it("opens the confirmation dialog and cancel does not delete", async () => {
    renderSongResources();

    fireEvent.keyDown(
      screen.getByRole("button", {
        name: `Open actions for ${resourceDisplayTitle}`,
      }),
      { key: "Enter", code: "Enter" },
    );
    fireEvent.click(await screen.findByText("Unlink resource"));

    expect(
      await screen.findByRole("heading", {
        name: `Unlink ${resourceDisplayTitle}`,
      }),
    ).toBeInTheDocument();

    const confirmationDialog = screen.getByRole("alertdialog");
    expect(confirmationDialog).toHaveTextContent("permanently unlink");
    expect(confirmationDialog).toHaveTextContent(resourceDisplayTitle);
    expect(confirmationDialog).toHaveTextContent(songName);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockDeleteResource).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("confirms delete, invalidates resources, closes the dialog, and shows success", async () => {
    const { invalidateQueriesSpy } = renderSongResources();

    fireEvent.keyDown(
      screen.getByRole("button", {
        name: `Open actions for ${resourceDisplayTitle}`,
      }),
      { key: "Enter", code: "Enter" },
    );
    fireEvent.click(await screen.findByText("Unlink resource"));
    fireEvent.click(
      await screen.findByRole("button", { name: "Unlink resource" }),
    );

    await waitFor(() => {
      expect(mockDeleteResource).toHaveBeenCalled();
    });
    expect(mockDeleteResource.mock.calls[0]?.[0]).toEqual({
      resourceId: resource.id,
      organizationId,
    });
    expect(
      mockUpdateResourceDeleteConfirmationPreference,
    ).not.toHaveBeenCalled();
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [
        "orpc",
        "resource",
        "getBySongId",
        {
          songId,
          organizationId,
        },
      ],
    });
    expect(toast.success).toHaveBeenCalledWith("Resource was unlinked", {
      id: "toast-id",
    });
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("shows an error toast and does not invalidate when delete fails", async () => {
    mockDeleteResource.mockRejectedValue(new Error("Delete failed"));
    const { invalidateQueriesSpy } = renderSongResources();

    fireEvent.keyDown(
      screen.getByRole("button", {
        name: `Open actions for ${resourceDisplayTitle}`,
      }),
      { key: "Enter", code: "Enter" },
    );
    fireEvent.click(await screen.findByText("Unlink resource"));
    fireEvent.click(
      await screen.findByRole("button", { name: "Unlink resource" }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Could not unlink resource: Delete failed",
        { id: "toast-id" },
      );
    });
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });

  it("persists the warning opt-out before unlinking the resource", async () => {
    const { invalidateQueriesSpy } = renderSongResources();

    fireEvent.keyDown(
      screen.getByRole("button", {
        name: `Open actions for ${resourceDisplayTitle}`,
      }),
      { key: "Enter", code: "Enter" },
    );
    fireEvent.click(await screen.findByText("Unlink resource"));

    expect(
      await screen.findByRole("heading", {
        name: `Unlink ${resourceDisplayTitle}`,
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Don't warn me again"));
    fireEvent.click(screen.getByRole("button", { name: "Unlink resource" }));

    await waitFor(() => {
      expect(mockUpdateResourceDeleteConfirmationPreference).toHaveBeenCalled();
    });
    expect(
      mockUpdateResourceDeleteConfirmationPreference.mock.calls[0]?.[0],
    ).toEqual({
      confirmResourceDelete: false,
    });
    expect(mockInvalidateUser).toHaveBeenCalledWith({ userId: "user_123" });
    expect(mockDeleteResource).toHaveBeenCalled();
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [
        "orpc",
        "resource",
        "getBySongId",
        {
          songId,
          organizationId,
        },
      ],
    });
  });

  it("still unlinks the resource when warning preference persistence fails", async () => {
    mockUpdateResourceDeleteConfirmationPreference.mockRejectedValue(
      new Error("Preference update failed"),
    );
    renderSongResources();

    fireEvent.keyDown(
      screen.getByRole("button", {
        name: `Open actions for ${resourceDisplayTitle}`,
      }),
      { key: "Enter", code: "Enter" },
    );
    fireEvent.click(await screen.findByText("Unlink resource"));
    fireEvent.click(screen.getByLabelText("Don't warn me again"));
    fireEvent.click(screen.getByRole("button", { name: "Unlink resource" }));

    await waitFor(() => {
      expect(mockDeleteResource).toHaveBeenCalled();
    });
    expect(toast.success).toHaveBeenCalledWith("Resource was unlinked", {
      id: "toast-id",
    });
  });

  it("unlinks resources without a confirmation dialog when warnings are disabled", async () => {
    mockUserData = createUserDataFixture({
      preferences: createUserPreferencesFixture({
        confirmResourceDelete: false,
      }),
    });
    renderSongResources();

    fireEvent.keyDown(
      screen.getByRole("button", {
        name: `Open actions for ${resourceDisplayTitle}`,
      }),
      { key: "Enter", code: "Enter" },
    );
    fireEvent.click(await screen.findByText("Unlink resource"));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(mockDeleteResource).toHaveBeenCalled();
    });
  });
});
