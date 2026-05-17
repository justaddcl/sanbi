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
  createUserWithMembershipsFixture,
} from "@testUtils/models/user/fixtures";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";

import { useSongResources } from "@modules/songs/queries/useSongResources";
import { getDisplayUrl } from "@modules/songs/utils/getDisplayUrl";
import { type Resource, type UserWithMemberships } from "@lib/types";

import { SongResources } from "../SongResources";

const mockCreateResource = jest.fn<Promise<Resource>, [unknown]>();
const mockUpdateResource = jest.fn<Promise<Resource>, [unknown]>();
const mockDeleteResource = jest.fn<Promise<Resource>, [unknown]>();
const mockUpdateResourceDeleteConfirmationPreference = jest.fn<
  Promise<NonNullable<UserWithMemberships>>,
  [unknown]
>();
const mockSetUserData = jest.fn<
  void,
  [
    { userId: string },
    (currentUserData: UserWithMemberships) => UserWithMemberships,
  ]
>();
let mockUserData: NonNullable<UserWithMemberships>;

jest.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ userId: "user_123" }),
}));

jest.mock("usehooks-ts", () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock(
  "@lib/trpc",
  () => ({
    trpc: {
      useUtils: () => ({
        user: {
          getUser: {
            setData: mockSetUserData,
          },
        },
      }),
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
      name: `Open actions for ${resource.title}`,
    }),
    { key: "Enter", code: "Enter" },
  );

  fireEvent.click(await screen.findByText("Edit resource"));

  return screen.findByRole("dialog");
};

const openCreateDrawer = async () => {
  fireEvent.click(screen.getByRole("button", { name: /add resource/i }));

  return screen.findByRole("dialog");
};

describe("SongResources resource editing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useMediaQuery as jest.Mock).mockImplementation((query: string) =>
      query.includes("min-width"),
    );
    mockUserData = createUserDataFixture();
    mockCreateResource.mockResolvedValue(resource);
    mockUpdateResource.mockResolvedValue(resource);
    mockDeleteResource.mockResolvedValue(resource);
    mockUpdateResourceDeleteConfirmationPreference.mockResolvedValue(
      createUserDataFixture({ confirmResourceDelete: false }),
    );
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
    expect(screen.getByLabelText("Name *")).toHaveValue(resource.title);
    expect(screen.getByLabelText("URL *")).toHaveValue(resource.url);
    expect(screen.getAllByText(resource.title).length).toBeGreaterThan(1);
    expect(
      screen.getAllByText(getDisplayUrl(resource.url)).length,
    ).toBeGreaterThan(1);
  });

  it("updates the drawer preview from local form edits without changing the list card", async () => {
    const updatedResourceName = createResourceName();
    const updatedResourceUrl = createResourceUrl();

    renderSongResources();

    await openEditDrawer();

    fireEvent.change(screen.getByLabelText("Name *"), {
      target: { value: updatedResourceName },
    });
    fireEvent.change(screen.getByLabelText("URL *"), {
      target: { value: updatedResourceUrl },
    });

    expect(screen.getByText(updatedResourceName)).toBeInTheDocument();
    expect(
      screen.getByText(getDisplayUrl(updatedResourceUrl)),
    ).toBeInTheDocument();
    expect(screen.getAllByText(resource.title).length).toBeGreaterThan(0);
  });

  it("renders the empty resource state as a list item", () => {
    (useSongResources as jest.Mock).mockReturnValue(
      createSongResourcesQueryFixture({ data: [] }),
    );

    renderSongResources();

    expect(screen.getByText("No song resources yet. Create one?").tagName).toBe(
      "LI",
    );
  });

  it("closes without submitting when cancelled", async () => {
    renderSongResources();

    await openEditDrawer();

    fireEvent.change(screen.getByLabelText("Name *"), {
      target: { value: "Cancelled Resource" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockUpdateResource).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("link", { name: new RegExp(resource.title, "i") }),
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

    fireEvent.change(screen.getByLabelText("Name *"), {
      target: { value: newResourceName },
    });
    fireEvent.blur(screen.getByLabelText("Name *"));
    fireEvent.change(screen.getByLabelText("URL *"), {
      target: { value: newResourceUrl },
    });
    fireEvent.blur(screen.getByLabelText("URL *"));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Create resource" }),
      ).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Create resource" }));

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

  it("warns when a resource URL does not start with https://", async () => {
    renderSongResources();

    await openCreateDrawer();

    fireEvent.change(screen.getByLabelText("URL *"), {
      target: { value: "http://spotify.com/lisen" },
    });
    fireEvent.blur(screen.getByLabelText("URL *"));

    expect(
      await screen.findByText("Please use a link starting with https://"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create resource" }),
    ).toBeDisabled();
  });

  it("submits updated resource values and invalidates the song resources query", async () => {
    const updatedResourceName = createResourceName();
    const updatedResourceUrl = createResourceUrl();

    const { invalidateQueriesSpy } = renderSongResources();

    await openEditDrawer();

    fireEvent.change(screen.getByLabelText("Name *"), {
      target: { value: updatedResourceName },
    });
    fireEvent.blur(screen.getByLabelText("Name *"));
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

    fireEvent.change(screen.getByLabelText("Name *"), {
      target: { value: updatedResourceName },
    });
    fireEvent.blur(screen.getByLabelText("Name *"));

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

  it("renders a destructive unlink resource action below a separator", async () => {
    renderSongResources();

    fireEvent.keyDown(
      screen.getByRole("button", {
        name: `Open actions for ${resource.title}`,
      }),
      { key: "Enter", code: "Enter" },
    );

    const deleteAction = await screen.findByText("Unlink resource");
    const separator = screen.getByRole("separator");

    expect(separator.compareDocumentPosition(deleteAction)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(deleteAction).toHaveClass("text-red-500");
  });

  it("opens the confirmation dialog and cancel does not delete", async () => {
    renderSongResources();

    fireEvent.keyDown(
      screen.getByRole("button", {
        name: `Open actions for ${resource.title}`,
      }),
      { key: "Enter", code: "Enter" },
    );
    fireEvent.click(await screen.findByText("Unlink resource"));

    expect(
      await screen.findByRole("heading", {
        name: `Unlink ${resource.title}`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `This will permanently unlink ${resource.title} from ${songName}. This can't be undone, but you can manually re-link the resource later if you need it again.`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("The linked site will not be affected."),
    ).not.toBeInTheDocument();

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
        name: `Open actions for ${resource.title}`,
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
        name: `Open actions for ${resource.title}`,
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

  it("persists the account preference when don't warn me again is checked", async () => {
    renderSongResources();

    fireEvent.keyDown(
      screen.getByRole("button", {
        name: `Open actions for ${resource.title}`,
      }),
      { key: "Enter", code: "Enter" },
    );
    fireEvent.click(await screen.findByText("Unlink resource"));
    fireEvent.click(await screen.findByLabelText("Don't warn me again"));
    fireEvent.click(screen.getByRole("button", { name: "Unlink resource" }));

    await waitFor(() => {
      expect(mockUpdateResourceDeleteConfirmationPreference).toHaveBeenCalled();
    });
    expect(
      mockUpdateResourceDeleteConfirmationPreference.mock.calls[0]?.[0],
    ).toEqual({
      confirmResourceDelete: false,
    });
    expect(mockSetUserData).toHaveBeenCalledWith(
      { userId: "user_123" },
      expect.any(Function),
    );

    const updateCachedUserData = mockSetUserData.mock.calls[0]?.[1];

    expect(updateCachedUserData?.(mockUserData)?.confirmResourceDelete).toBe(
      false,
    );
  });

  it("still invalidates resources when saving the delete confirmation preference fails", async () => {
    mockUpdateResourceDeleteConfirmationPreference.mockRejectedValue(
      new Error("Preference failed"),
    );
    const { invalidateQueriesSpy } = renderSongResources();

    fireEvent.keyDown(
      screen.getByRole("button", {
        name: `Open actions for ${resource.title}`,
      }),
      { key: "Enter", code: "Enter" },
    );
    fireEvent.click(await screen.findByText("Unlink resource"));
    fireEvent.click(await screen.findByLabelText("Don't warn me again"));
    fireEvent.click(screen.getByRole("button", { name: "Unlink resource" }));

    await waitFor(() => {
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
    expect(toast.error).toHaveBeenCalledWith(
      "Resource was unlinked, but the confirmation preference could not be saved",
      { id: "toast-id" },
    );
  });

  it("skips the dialog when resource delete confirmations are disabled", async () => {
    mockUserData = createUserDataFixture({
      confirmResourceDelete: false,
    });

    renderSongResources();

    fireEvent.keyDown(
      screen.getByRole("button", {
        name: `Open actions for ${resource.title}`,
      }),
      { key: "Enter", code: "Enter" },
    );
    fireEvent.click(await screen.findByText("Unlink resource"));

    await waitFor(() => {
      expect(mockDeleteResource).toHaveBeenCalled();
    });
    expect(
      screen.queryByRole("heading", {
        name: `Unlink ${resource.title}`,
      }),
    ).not.toBeInTheDocument();
  });
});
