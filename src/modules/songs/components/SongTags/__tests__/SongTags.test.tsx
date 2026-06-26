import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createTagFixture } from "@testUtils/fixtures/tags";
import { createUuid } from "@testUtils/generators/createUuid";
import {
  mockDeleteSongTagMutate,
  mockInvalidateSong,
  mockInvalidateSongTags,
  resetMockTrpc,
  setMockSongTagsQuery,
  type SongTagResult,
  type TrpcMockModule,
} from "@testUtils/mocks/trpc";
import { toast } from "sonner";

import { type Tag } from "@lib/types";

import { SongTags } from "../SongTags";

jest.mock("@lib/trpc", () => {
  const { mockTrpc } = jest.requireActual<TrpcMockModule>(
    "@testUtils/mocks/trpc",
  );

  return { trpc: mockTrpc };
});

jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: jest.fn(() => ({ isDesktop: true })),
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
const firstTag = createTagFixture({
  id: createUuid(),
  organizationId,
  tag: "Communion",
});
const secondTag = createTagFixture({
  id: createUuid(),
  organizationId,
  tag: "Prayer",
});

const createSongTagResult = (tag: Tag): SongTagResult => ({
  songId,
  tagId: tag.id,
  tag: {
    id: tag.id,
    tag: tag.tag,
  },
});

const renderSongTags = () => {
  render(<SongTags songId={songId} organizationId={organizationId} />);
};

describe("SongTags", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockTrpc();
    setMockSongTagsQuery({
      data: [createSongTagResult(firstTag), createSongTagResult(secondTag)],
      error: null,
      isLoading: false,
    });
  });

  it("renders the song tag list and named remove actions", () => {
    renderSongTags();

    expect(screen.getByText(firstTag.tag)).toBeInTheDocument();
    expect(screen.getByText(secondTag.tag)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `Remove ${firstTag.tag} tag` }),
    ).toBeInTheDocument();
  });

  it("removes a song tag and refreshes song tag data", async () => {
    renderSongTags();

    fireEvent.click(
      screen.getByRole("button", { name: `Remove ${firstTag.tag} tag` }),
    );

    const lastDeleteSongTagCall = mockDeleteSongTagMutate.mock.calls.at(-1);

    expect(lastDeleteSongTagCall?.[0]).toEqual({
      organizationId,
      songId,
      tagId: firstTag.id,
    });
    expect(typeof lastDeleteSongTagCall?.[1]?.onError).toBe("function");
    expect(typeof lastDeleteSongTagCall?.[1]?.onSettled).toBe("function");
    expect(typeof lastDeleteSongTagCall?.[1]?.onSuccess).toBe("function");
    await waitFor(() => {
      expect(mockInvalidateSongTags).toHaveBeenCalledWith({
        organizationId,
        songId,
      });
    });
    expect(mockInvalidateSong).toHaveBeenCalledWith({
      organizationId,
      songId,
    });
  });

  it("shows a loading state while song tags load", () => {
    setMockSongTagsQuery({
      data: undefined,
      error: null,
      isLoading: true,
    });

    renderSongTags();

    expect(
      screen.getByRole("status", { name: "Loading song tags" }),
    ).toBeInTheDocument();
  });

  it("reports song tag loading errors", async () => {
    const queryError = new Error("Song tags unavailable");
    setMockSongTagsQuery({
      data: undefined,
      error: queryError,
      isLoading: false,
    });

    const { container } = render(
      <SongTags songId={songId} organizationId={organizationId} />,
    );

    expect(container).toBeEmptyDOMElement();
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        `Could not get the tags for this song: ${queryError.message}`,
      );
    });
  });
});
