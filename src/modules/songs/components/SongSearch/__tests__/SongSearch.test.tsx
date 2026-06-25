import {
  type ComponentProps,
  type useEffect,
  type useState,
} from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createSearchSongResultFixture } from "@testUtils/models/search/fixtures";

import { Command } from "@components/ui/command";
import { trpc } from "@lib/trpc";

import { SongSearch } from "../SongSearch";

jest.mock("@lib/trpc", () => ({
  trpc: {
    song: {
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
    useDebounceValue: <Value,>(value: Value, delay: number) => {
      const [debouncedValue, setDebouncedValue] = React.useState(value);

      React.useEffect(() => {
        const timeoutId = window.setTimeout(() => {
          setDebouncedValue(value);
        }, delay);

        return () => window.clearTimeout(timeoutId);
      }, [delay, value]);

      return [debouncedValue, setDebouncedValue] as const;
    },
  };
});

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

const mockSongSearchUseQuery = trpc.song.search.useQuery as jest.Mock;

const renderSongSearch = ({
  onSongSelect = jest.fn(),
  organizationId = "organization-1",
}: {
  onSongSelect?: ComponentProps<typeof SongSearch>["onSongSelect"];
  organizationId?: string;
} = {}) => {
  render(
    <Command shouldFilter={false}>
      <SongSearch organizationId={organizationId} onSongSelect={onSongSelect} />
    </Command>,
  );

  return { onSongSelect };
};

const enterSearchInput = (searchInput: string) => {
  fireEvent.change(screen.getByPlaceholderText("Search songs or tags"), {
    target: { value: searchInput },
  });
};

const getResultItem = (matchType: "song" | "tag") => {
  const resultItem = document.querySelector(
    `[data-search-match-type='${matchType}']`,
  );

  if (!(resultItem instanceof HTMLElement)) {
    throw new Error(`Could not find ${matchType}-matched result item`);
  }

  return resultItem;
};

describe("SongSearch", () => {
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
  });

  beforeEach(() => {
    mockSongSearchUseQuery.mockReturnValue({
      data: [titleMatchedSong, tagMatchedSong],
      isFetching: false,
      isError: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("uses song.search with the debounced query after the minimum search length", async () => {
    renderSongSearch();

    enterSearchInput("c");

    expect(mockSongSearchUseQuery).toHaveBeenLastCalledWith(
      {
        organizationId: "organization-1",
        searchInput: "",
        limit: 50,
      },
      {
        enabled: false,
      },
    );

    enterSearchInput("comm");

    await waitFor(() => {
      expect(mockSongSearchUseQuery).toHaveBeenLastCalledWith(
        {
          organizationId: "organization-1",
          searchInput: "comm",
          limit: 50,
        },
        {
          enabled: true,
        },
      );
    });
  });

  it("groups title matches and tag matches with highlighted result rows", async () => {
    renderSongSearch();

    enterSearchInput("comm");

    await waitFor(() => {
      expect(getResultItem("song")).toHaveTextContent("Communion Hymn");
      expect(getResultItem("tag")).toHaveTextContent("Amazing Grace");
    });
    expect(screen.getAllByText("Songs")).toHaveLength(2);
    expect(screen.getAllByText("Tags")).toHaveLength(2);
    expect(screen.getByText("Search results (2)")).toBeInTheDocument();
  });

  it("renders picker keyboard shortcuts without action menu shortcuts", async () => {
    renderSongSearch();

    enterSearchInput("comm");

    await waitFor(() => {
      expect(screen.getByText("Search results (2)")).toBeInTheDocument();
    });

    expect(screen.getByText("Navigate")).toBeInTheDocument();
    expect(screen.getByText("Select")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
    expect(screen.queryByText("Actions")).not.toBeInTheDocument();
  });

  it("filters picker results by song and tag result groups", async () => {
    renderSongSearch();

    enterSearchInput("comm");
    await waitFor(() => {
      expect(getResultItem("song")).toHaveTextContent("Communion Hymn");
    });

    fireEvent.click(screen.getByRole("button", { name: /tags/i }));

    expect(
      document.querySelector("[data-search-match-type='song']"),
    ).not.toBeInTheDocument();
    expect(getResultItem("tag")).toHaveTextContent("Amazing Grace");
    expect(screen.getByText("Search results (1)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /songs/i }));

    expect(getResultItem("song")).toHaveTextContent("Communion Hymn");
    expect(getResultItem("tag")).toHaveTextContent("Amazing Grace");
    expect(screen.getByText("Search results (2)")).toBeInTheDocument();
  });

  it("calls selection callbacks with the selected song and match type", async () => {
    const onSongSelect = jest.fn();
    renderSongSearch({ onSongSelect });

    enterSearchInput("comm");

    await waitFor(() => {
      expect(getResultItem("song")).toBeInTheDocument();
    });

    fireEvent.click(getResultItem("song"));
    fireEvent.click(getResultItem("tag"));

    expect(onSongSelect).toHaveBeenNthCalledWith(
      1,
      titleMatchedSong,
      "song",
    );
    expect(onSongSelect).toHaveBeenNthCalledWith(2, tagMatchedSong, "tag");
  });

  it("renders loading, error, and empty states", async () => {
    mockSongSearchUseQuery.mockReturnValue({
      data: [],
      isFetching: true,
      isError: false,
    });

    const { rerender } = render(
      <Command shouldFilter={false}>
        <SongSearch organizationId="organization-1" onSongSelect={jest.fn()} />
      </Command>,
    );

    enterSearchInput("missing");

    expect(
      await screen.findByLabelText("Searching songs and tags"),
    ).toBeInTheDocument();

    mockSongSearchUseQuery.mockReturnValue({
      data: [],
      isFetching: false,
      isError: true,
    });

    rerender(
      <Command shouldFilter={false}>
        <SongSearch organizationId="organization-1" onSongSelect={jest.fn()} />
      </Command>,
    );

    expect(
      await screen.findByText(
        "Search is unavailable. Please try again in a moment.",
      ),
    ).toBeInTheDocument();

    mockSongSearchUseQuery.mockReturnValue({
      data: [],
      isFetching: false,
      isError: false,
    });

    rerender(
      <Command shouldFilter={false}>
        <SongSearch organizationId="organization-1" onSongSelect={jest.fn()} />
      </Command>,
    );

    expect(
      await screen.findByText('No results found for "missing".'),
    ).toBeInTheDocument();
  });
});
