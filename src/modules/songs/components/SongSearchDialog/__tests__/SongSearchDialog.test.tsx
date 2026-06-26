import { type ComponentProps, type useEffect, type useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createSetSectionWithSongsFixture } from "@testUtils/fixtures/setSections";
import { createSearchSongResultFixture } from "@testUtils/models/search/fixtures";

import { trpc } from "@lib/trpc";

import { type ConfigureSongForSetProps } from "../../ConfigureSongForSet/ConfigureSongForSet";
import { SongSearchDialog } from "../SongSearchDialog";

const mockRouterReplace = jest.fn();
const mockOnOpenChange = jest.fn();
let mockSearchParams = new URLSearchParams();

const mockConfigureSongForSet = jest.fn(
  ({
    onSubmit,
    prePopulatedSetSectionId,
    selectedSong,
    setDialogStep,
  }: ConfigureSongForSetProps) => (
    <div>
      <h2>Add song to set</h2>
      <p>{selectedSong.name}</p>
      <p>Section: {prePopulatedSetSectionId ?? "none"}</p>
      <button type="button" onClick={() => setDialogStep("search")}>
        Back to search
      </button>
      <button type="button" onClick={onSubmit}>
        Finish add
      </button>
    </div>
  ),
);

jest.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    isLoaded: true,
    userId: "user-1",
  }),
}));

jest.mock("next/navigation", () => ({
  useParams: () => ({ organization: "organization-1" }),
  useRouter: () => ({ replace: mockRouterReplace }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock("@lib/trpc", () => ({
  trpc: {
    song: {
      get: {
        useQuery: jest.fn(),
      },
      search: {
        useQuery: jest.fn(),
      },
    },
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

jest.mock("../../ConfigureSongForSet/ConfigureSongForSet", () => ({
  ConfigureSongForSet: (props: ConfigureSongForSetProps) =>
    mockConfigureSongForSet(props),
}));

class ResizeObserverMock {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

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

const existingSetSection = createSetSectionWithSongsFixture({
  id: "section-1",
  setId: "set-1",
  songs: [],
});

const mockSongSearchUseQuery = trpc.song.search.useQuery as jest.Mock;
const mockSongGetUseQuery = trpc.song.get.useQuery as jest.Mock;

const renderSongSearchDialog = (
  props: Partial<ComponentProps<typeof SongSearchDialog>> = {},
) => {
  render(
    <SongSearchDialog
      open
      onOpenChange={mockOnOpenChange}
      existingSetSections={[existingSetSection]}
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

describe("SongSearchDialog", () => {
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
    mockSearchParams = new URLSearchParams();
    mockSongSearchUseQuery.mockReturnValue({
      data: [titleMatchedSong, tagMatchedSong],
      isFetching: false,
      isError: false,
    });
    mockSongGetUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("advances to configure when selecting a title result", async () => {
    renderSongSearchDialog();

    enterSearchInput("comm");
    fireEvent.click(await getResultItem("song"));

    expect(
      await screen.findByRole("heading", { name: "Add song to set" }),
    ).toBeInTheDocument();
    expect(screen.getByText(titleMatchedSong.name)).toBeInTheDocument();
    expect(mockConfigureSongForSet).toHaveBeenLastCalledWith(
      expect.objectContaining({
        selectedSong: titleMatchedSong,
      }),
    );
  });

  it("advances to configure when selecting a tag-matched result", async () => {
    renderSongSearchDialog();

    enterSearchInput("comm");
    fireEvent.click(await getResultItem("tag"));

    expect(
      await screen.findByRole("heading", { name: "Add song to set" }),
    ).toBeInTheDocument();
    expect(screen.getByText(tagMatchedSong.name)).toBeInTheDocument();
    expect(mockConfigureSongForSet).toHaveBeenLastCalledWith(
      expect.objectContaining({
        selectedSong: tagMatchedSong,
      }),
    );
  });

  it("configures the preselected song from URL state with the preselected section", async () => {
    const preSelectedSong = {
      id: "preselected-song",
      name: "Preselected Grace",
      preferredKey: "d",
      isArchived: false,
    };

    mockSearchParams = new URLSearchParams({
      addSongDialogOpen: "1",
      setSectionId: "section-1",
      songId: preSelectedSong.id,
    });
    mockSongGetUseQuery.mockReturnValue({
      data: preSelectedSong,
      isLoading: false,
    });

    renderSongSearchDialog({
      prePopulatedSetSectionId: "section-1",
      preSelectedSongId: preSelectedSong.id,
    });

    expect(
      await screen.findByRole("heading", { name: "Add song to set" }),
    ).toBeInTheDocument();
    expect(screen.getByText(preSelectedSong.name)).toBeInTheDocument();
    expect(screen.getByText("Section: section-1")).toBeInTheDocument();
    const lastConfigureProps = mockConfigureSongForSet.mock.lastCall?.[0];
    expect(lastConfigureProps?.prePopulatedSetSectionId).toBe("section-1");
    expect(lastConfigureProps?.selectedSong).toEqual(
      expect.objectContaining({
        name: preSelectedSong.name,
        songId: preSelectedSong.id,
      }),
    );
  });

  it("resets search state when leaving configure or closing from configure", async () => {
    renderSongSearchDialog();

    enterSearchInput("comm");
    fireEvent.click(await getResultItem("tag"));
    fireEvent.click(
      await screen.findByRole("button", { name: "Back to search" }),
    );

    expect(screen.getByPlaceholderText("Search songs or tags")).toHaveValue("");

    enterSearchInput("comm");
    fireEvent.click(await getResultItem("song"));
    fireEvent.click(await screen.findByRole("button", { name: "Finish add" }));

    expect(mockOnOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByPlaceholderText("Search songs or tags")).toHaveValue("");
    expect(
      screen.queryByRole("heading", { name: "Add song to set" }),
    ).not.toBeInTheDocument();
  });
});
