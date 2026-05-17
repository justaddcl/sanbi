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
import { useMediaQuery } from "usehooks-ts";

import { useSongResources } from "@modules/songs/queries/useSongResources";
import { getDisplayUrl } from "@modules/songs/utils/getDisplayUrl";
import { type Resource, type UserWithMemberships } from "@lib/types";

import { SongResources } from "../SongResources";

const mockCreateResource = jest.fn<Promise<Resource>, [unknown]>();
const mockUpdateResource = jest.fn<Promise<Resource>, [unknown]>();
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
      user: {
        getUser: {
          useQuery: jest.fn(() => ({ data: mockUserData })),
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
      <SongResources songId={songId} organizationId={organizationId} />
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
    window.history.replaceState(null, "", "/songs/test-song");
    (useMediaQuery as jest.Mock).mockImplementation((query: string) =>
      query.includes("min-width"),
    );
    mockUserData = createUserDataFixture();
    mockCreateResource.mockResolvedValue(resource);
    mockUpdateResource.mockResolvedValue(resource);
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

  it("renders the empty resource state as a full-width list item", () => {
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
    expect(
      screen.getByRole("heading", { name: "No resources yet" }).closest("li"),
    ).toHaveClass("md:col-span-2");
    expect(
      screen.getByRole("heading", { name: "No resources yet" }).closest("li"),
    ).not.toHaveClass("border");
  });

  it("opens the create resource dialog from the empty-state CTA", async () => {
    (useSongResources as jest.Mock).mockReturnValue(
      createSongResourcesQueryFixture({ data: [] }),
    );

    renderSongResources();

    fireEvent.click(screen.getByRole("button", { name: "Link a resource" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Create a song resource" }),
    ).toBeInTheDocument();
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
});
