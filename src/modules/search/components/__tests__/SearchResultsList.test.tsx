import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { Command } from "@components/ui/command";

import { SearchResultsList } from "../SearchResultsList";
import { type SearchSongResult } from "../types";

class ResizeObserverMock {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

const songResult: SearchSongResult = {
  songId: "4af1ad2a-5aac-4a35-91f9-f51edc376e03",
  name: "Amazing Grace",
  preferredKey: "g",
  isArchived: false,
  similarityScore: 0.9,
  tags: ["Communion", "Classic"],
  matchedTags: [],
  lastPlayedDate: null,
};

const renderSearchResultsList = ({
  onAddSongToCurrentSet,
  onAddSongToSet = jest.fn(),
  onSongSelect = jest.fn(),
}: {
  onAddSongToCurrentSet?: (result: SearchSongResult) => void;
  onAddSongToSet?: (result: SearchSongResult) => void;
  onSongSelect?: (songId: string) => void;
} = {}) => {
  render(
    <Command shouldFilter={false}>
      <SearchResultsList
        activeFilter="songs"
        emptyResultsMessage="No results"
        hasOverflow={false}
        isError={false}
        isLoading={false}
        normalizedSearchInput="grace"
        onAddSongToCurrentSet={onAddSongToCurrentSet}
        onAddSongToSet={onAddSongToSet}
        onSongSelect={onSongSelect}
        resultCountLabel="1"
        visibleResultCount={1}
        visibleSongResults={[songResult]}
        visibleTagResults={[]}
      />
    </Command>,
  );

  const resultItem = document.querySelector(
    `[data-song-id="${songResult.songId}"]`,
  );
  if (!(resultItem instanceof HTMLElement)) {
    throw new Error("Could not find rendered search result item");
  }

  return {
    onAddSongToCurrentSet,
    onAddSongToSet,
    onSongSelect,
    resultItem,
  };
};

describe("SearchResultsList", () => {
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

  it("opens the selected result action menu with Shift+Enter", async () => {
    const { resultItem } = renderSearchResultsList();
    resultItem.setAttribute("data-selected", "true");

    fireEvent.keyDown(document, { key: "Enter", shiftKey: true });

    expect(
      await screen.findByRole("menuitem", { name: /add to a set/i }),
    ).toBeInTheDocument();
  });

  it("does not open the selected song while the action menu owns Enter", async () => {
    const onSongSelect = jest.fn();
    const { resultItem } = renderSearchResultsList({ onSongSelect });
    resultItem.setAttribute("data-selected", "true");

    fireEvent.keyDown(document, { key: "Enter", shiftKey: true });
    await screen.findByRole("menuitem", { name: /add to a set/i });

    fireEvent.keyDown(document, { key: "Enter" });
    fireEvent.click(resultItem);

    expect(onSongSelect).not.toHaveBeenCalled();
  });

  it("selects the add-to-set action without opening the song", async () => {
    const onAddSongToSet = jest.fn();
    const onSongSelect = jest.fn();
    const { resultItem } = renderSearchResultsList({
      onAddSongToSet,
      onSongSelect,
    });
    resultItem.setAttribute("data-selected", "true");

    fireEvent.keyDown(document, { key: "Enter", shiftKey: true });
    fireEvent.click(
      await screen.findByRole("menuitem", { name: /add to a set/i }),
    );

    expect(onAddSongToSet).toHaveBeenCalledWith(songResult);
    expect(onSongSelect).not.toHaveBeenCalled();
  });

  it("shows the current-set action when current set context is available", async () => {
    const onAddSongToCurrentSet = jest.fn();
    const { resultItem } = renderSearchResultsList({
      onAddSongToCurrentSet,
    });
    resultItem.setAttribute("data-selected", "true");

    fireEvent.keyDown(document, { key: "Enter", shiftKey: true });
    fireEvent.click(
      await screen.findByRole("menuitem", { name: /add to current set/i }),
    );

    expect(onAddSongToCurrentSet).toHaveBeenCalledWith(songResult);
  });

  it("does not open an action menu when no result is selected", async () => {
    const { resultItem } = renderSearchResultsList();
    resultItem.removeAttribute("data-selected");

    fireEvent.keyDown(document, { key: "Enter", shiftKey: true });

    await waitFor(() => {
      expect(
        screen.queryByRole("menuitem", { name: /add to a set/i }),
      ).not.toBeInTheDocument();
    });
  });
});
