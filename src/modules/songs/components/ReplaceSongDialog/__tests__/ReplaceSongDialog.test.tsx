import { type ComponentProps, type useEffect, type useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createSetSectionSongWithSongDataFixture } from "@testUtils/fixtures/setSectionSongs";
import { createSongFixture } from "@testUtils/fixtures/songs";
import {
  mockInvalidateSet,
  mockReplaceSongMutate,
  resetMockTrpc,
  setMockSongSearchQuery,
  type TrpcMockModule,
} from "@testUtils/mocks/trpc";
import { createSearchSongResultFixture } from "@testUtils/models/search/fixtures";
import { toast } from "sonner";

import { ReplaceSongDialog } from "../ReplaceSongDialog";

const mockSetOpen = jest.fn();

jest.mock("@modules/users/api/queries", () => ({
  useUserQuery: jest.fn(() => ({
    data: {
      memberships: [{ organizationId: "organization-1" }],
    },
    isAuthLoaded: true,
    isLoading: false,
  })),
}));

jest.mock("@lib/trpc", () => {
  const { mockTrpc } = jest.requireActual<TrpcMockModule>(
    "@testUtils/mocks/trpc",
  );

  return { trpc: mockTrpc };
});

jest.mock("sonner", () => ({
  toast: {
    dismiss: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("usehooks-ts", () => {
  const React = jest.requireActual<{
    useEffect: typeof useEffect;
    useState: typeof useState;
  }>("react");

  return {
    useDebounceValue: <Value,>(value: Value) => {
      const [debouncedValue, setDebouncedValue] = React.useState(value);

      React.useEffect(() => {
        setDebouncedValue(value);
      }, [value]);

      return [debouncedValue, setDebouncedValue] as const;
    },
  };
});

class ResizeObserverMock {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

const currentSong = createSetSectionSongWithSongDataFixture({
  id: "set-section-song-1",
  setSectionId: "set-section-1",
  songId: "current-song",
  organizationId: "organization-1",
  song: createSongFixture({
    id: "current-song",
    name: "Current Hymn",
    organizationId: "organization-1",
  }),
});

const titleMatchedSong = createSearchSongResultFixture({
  songId: "title-song",
  name: "Communion Hymn",
  matchedTags: [],
  tags: ["Classic"],
});

const tagMatchedSong = createSearchSongResultFixture({
  songId: "tag-song",
  name: "Amazing Grace",
  matchedTags: ["Communion"],
  tags: ["Communion"],
});

const selfMatchedSong = createSearchSongResultFixture({
  songId: currentSong.songId,
  name: currentSong.song.name,
  matchedTags: [],
  tags: ["Classic"],
});

const mockToast = jest.mocked(toast);

const renderReplaceSongDialog = (
  props: Partial<ComponentProps<typeof ReplaceSongDialog>> = {},
) => {
  render(
    <ReplaceSongDialog
      open
      setOpen={mockSetOpen}
      currentSong={currentSong}
      setId="set-1"
      {...props}
    />,
  );
};

const enterSearchInput = (searchInput: string) => {
  fireEvent.change(screen.getByPlaceholderText("Search songs or tags"), {
    target: { value: searchInput },
  });
};

const getResultItem = async (matchType: "song" | "tag") => {
  await waitFor(() => {
    expect(
      document.querySelector(`[data-search-match-type='${matchType}']`),
    ).toBeInTheDocument();
  });

  const resultItem = document.querySelector(
    `[data-search-match-type='${matchType}']`,
  );

  if (!(resultItem instanceof HTMLElement)) {
    throw new Error(`Could not find ${matchType}-matched result item`);
  }

  return resultItem;
};

describe("ReplaceSongDialog", () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, "ResizeObserver", {
      configurable: true,
      value: ResizeObserverMock,
      writable: true,
    });

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

    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: (handle: number) => window.clearTimeout(handle),
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    resetMockTrpc();
    setMockSongSearchQuery({
      data: [titleMatchedSong, tagMatchedSong],
      isFetching: false,
      isError: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("advances to confirmation when selecting a title result", async () => {
    const onSongSelect = jest.fn();
    renderReplaceSongDialog({ onSongSelect });

    enterSearchInput("comm");
    fireEvent.click(await getResultItem("song"));

    expect(await screen.findByText("Current song")).toBeInTheDocument();
    expect(screen.getByText("New song")).toBeInTheDocument();
    expect(screen.getByText(currentSong.song.name)).toBeInTheDocument();
    expect(screen.getByText(titleMatchedSong.name)).toBeInTheDocument();
    expect(onSongSelect).toHaveBeenLastCalledWith(titleMatchedSong);
  });

  it("advances to confirmation when selecting a tag-matched result", async () => {
    renderReplaceSongDialog();

    enterSearchInput("comm");
    fireEvent.click(await getResultItem("tag"));

    expect(await screen.findByText("New song")).toBeInTheDocument();
    expect(screen.getByText(tagMatchedSong.name)).toBeInTheDocument();
  });

  it("shows an error and does not mutate when replacing a song with itself", async () => {
    setMockSongSearchQuery({
      data: [selfMatchedSong],
      isFetching: false,
      isError: false,
    });

    renderReplaceSongDialog();

    enterSearchInput("curr");
    fireEvent.click(await getResultItem("song"));
    fireEvent.click(screen.getByRole("button", { name: "Replace song" }));

    expect(mockToast.error).toHaveBeenLastCalledWith(
      "Cannot replace a song with itself",
    );
    expect(mockReplaceSongMutate).not.toHaveBeenCalled();
  });

  it("replaces the song, invalidates the set, and closes the dialog", async () => {
    renderReplaceSongDialog();

    enterSearchInput("comm");
    fireEvent.click(await getResultItem("song"));
    fireEvent.click(screen.getByRole("button", { name: "Replace song" }));

    expect(mockToast.loading).toHaveBeenLastCalledWith("Replacing song...");
    const [mutationInput, mutationOptions] =
      mockReplaceSongMutate.mock.lastCall ?? [];
    expect(mutationInput).toEqual({
      organizationId: "organization-1",
      setSectionSongId: currentSong.id,
      replacementSongId: titleMatchedSong.songId,
    });
    expect(typeof mutationOptions?.onError).toBe("function");
    expect(typeof mutationOptions?.onSuccess).toBe("function");
    await waitFor(() => {
      expect(mockInvalidateSet).toHaveBeenLastCalledWith({ setId: "set-1" });
    });
    expect(mockToast.dismiss).toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenLastCalledWith("Song replaced");
    expect(mockSetOpen).toHaveBeenLastCalledWith(false);
  });
});
