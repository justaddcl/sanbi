import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createTagFixture } from "@testUtils/fixtures/tags";
import { createUuid } from "@testUtils/generators/createUuid";
import {
  mockCreateSongTagMutate,
  mockCreateTagMutate,
  mockDeleteSongTagMutate,
  mockInvalidateOrganizationTags,
  mockInvalidateSongTags,
  mockTrpc,
  resetMockTrpc,
  setMockCreatedTag,
  setMockOrganizationTagsQuery,
  type SongTagResult,
  type TrpcMockModule,
} from "@testUtils/mocks/trpc";
import { toast } from "sonner";

import { type Tag } from "@lib/types";
import { useResponsive } from "@/hooks/useResponsive";

import { SongTagSelector } from "../SongTagSelector";

jest.mock("@lib/trpc", () => {
  const { mockTrpc } = jest.requireActual<TrpcMockModule>(
    "@testUtils/mocks/trpc",
  );

  return { trpc: mockTrpc };
});

jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    loading: jest.fn(() => "toast-id"),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const organizationId = createUuid();
const songId = createUuid();
const selectedTag = createTagFixture({
  id: createUuid(),
  organizationId,
  tag: "Communion",
});
const unselectedTag = createTagFixture({
  id: createUuid(),
  organizationId,
  tag: "Prayer",
});
const newTagName = "Blessing";

const createSongTagResult = (tag: Tag): SongTagResult => ({
  songId,
  tagId: tag.id,
  tag: {
    id: tag.id,
    tag: tag.tag,
  },
});

const renderSongTagSelector = (songTags: SongTagResult[] = []) => {
  render(
    <SongTagSelector
      songId={songId}
      organizationId={organizationId}
      songTags={songTags}
    />,
  );
};

const openSelector = async () => {
  fireEvent.click(screen.getByRole("button", { name: "Add Tag" }));

  return screen.findByPlaceholderText("Search tags...");
};

describe("SongTagSelector", () => {
  beforeAll(() => {
    Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: jest.fn(),
      writable: true,
    });

    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) => window.setTimeout(callback, 0),
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    resetMockTrpc();
    setMockCreatedTag(
      createTagFixture({
        id: "created-tag-id",
        organizationId,
        tag: newTagName,
      }),
    );
    setMockOrganizationTagsQuery({
      data: [selectedTag, unselectedTag],
      error: null,
      isLoading: false,
    });
    (useResponsive as jest.Mock).mockReturnValue({ isDesktop: true });
  });

  it("filters organization tags by search text", async () => {
    renderSongTagSelector();

    const searchInput = await openSelector();
    expect(
      screen.getByRole("group", { name: "Available tags" }),
    ).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "pray" } });

    expect(
      screen.getByRole("button", { name: `Add ${unselectedTag.tag} tag` }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: `Add ${selectedTag.tag} tag` }),
    ).not.toBeInTheDocument();
  });

  it("attaches an existing tag from the selector", async () => {
    renderSongTagSelector();
    await openSelector();

    fireEvent.click(
      screen.getByRole("button", { name: `Add ${unselectedTag.tag} tag` }),
    );

    const lastCreateSongTagCall = mockCreateSongTagMutate.mock.calls.at(-1);

    expect(lastCreateSongTagCall?.[0]).toEqual({
      organizationId,
      songId,
      tagId: unselectedTag.id,
    });
    expect(typeof lastCreateSongTagCall?.[1]?.onError).toBe("function");
    expect(typeof lastCreateSongTagCall?.[1]?.onSuccess).toBe("function");
    await waitFor(() => {
      expect(mockInvalidateSongTags).toHaveBeenCalledWith({
        organizationId,
        songId,
      });
    });
  });

  it("removes a selected tag from the selector", async () => {
    renderSongTagSelector([createSongTagResult(selectedTag)]);
    await openSelector();

    const removeButton = screen.getByRole("button", {
      name: `Remove ${selectedTag.tag} tag`,
    });

    expect(removeButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(removeButton);

    const lastDeleteSongTagCall = mockDeleteSongTagMutate.mock.calls.at(-1);

    expect(lastDeleteSongTagCall?.[0]).toEqual({
      organizationId,
      songId,
      tagId: selectedTag.id,
    });
    expect(typeof lastDeleteSongTagCall?.[1]?.onError).toBe("function");
    expect(typeof lastDeleteSongTagCall?.[1]?.onSuccess).toBe("function");
  });

  it("creates a new tag and attaches it to the song", async () => {
    renderSongTagSelector();

    const searchInput = await openSelector();
    fireEvent.change(searchInput, { target: { value: newTagName } });
    fireEvent.click(
      screen.getByRole("button", { name: `Create ${newTagName} tag` }),
    );

    const lastCreateTagCall = mockCreateTagMutate.mock.calls.at(-1);

    expect(lastCreateTagCall?.[0]).toEqual({
      organizationId,
      tag: newTagName,
    });
    expect(typeof lastCreateTagCall?.[1]?.onError).toBe("function");
    expect(typeof lastCreateTagCall?.[1]?.onSuccess).toBe("function");
    expect(mockCreateSongTagMutate).toHaveBeenCalledWith({
      organizationId,
      songId,
      tagId: "created-tag-id",
    });
    await waitFor(() => {
      expect(mockInvalidateOrganizationTags).toHaveBeenCalledWith({
        organizationId,
      });
    });
  });

  it("selects the highlighted tag with keyboard navigation", async () => {
    renderSongTagSelector();

    const searchInput = await openSelector();
    fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    const lastCreateSongTagCall = mockCreateSongTagMutate.mock.calls.at(-1);

    expect(lastCreateSongTagCall?.[0]).toEqual({
      organizationId,
      songId,
      tagId: selectedTag.id,
    });
    expect(typeof lastCreateSongTagCall?.[1]?.onError).toBe("function");
    expect(typeof lastCreateSongTagCall?.[1]?.onSuccess).toBe("function");
  });

  it("shows the loading state while tags are loading", async () => {
    setMockOrganizationTagsQuery({
      data: undefined,
      error: null,
      isLoading: true,
    });

    renderSongTagSelector();
    await openSelector();

    expect(
      screen.getByRole("status", { name: "Loading tags" }),
    ).toBeInTheDocument();
  });

  it("reports tag loading errors", async () => {
    const queryError = new Error("Tag service unavailable");
    setMockOrganizationTagsQuery({
      data: undefined,
      error: queryError,
      isLoading: false,
    });

    renderSongTagSelector();

    fireEvent.click(screen.getByRole("button", { name: "Add Tag" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        `Could not get the tags for your team: ${queryError.message}`,
      );
    });
  });

  it("requests tags only when the selector is open", async () => {
    renderSongTagSelector();

    expect(mockTrpc.tag.getByOrganization.useQuery).toHaveBeenLastCalledWith(
      { organizationId },
      { enabled: false },
    );

    await openSelector();

    expect(mockTrpc.tag.getByOrganization.useQuery).toHaveBeenLastCalledWith(
      { organizationId },
      { enabled: true },
    );
  });
});
