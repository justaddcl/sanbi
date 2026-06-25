import { act, renderHook } from "@testing-library/react";

import { trpc } from "@lib/trpc";

import { useSongSearchResults } from "../useSongSearchResults";

jest.mock("@lib/trpc", () => ({
  trpc: {
    song: {
      search: {
        useQuery: jest.fn(),
      },
    },
  },
}));

const mockSongSearchUseQuery = trpc.song.search.useQuery as jest.Mock;

describe("useSongSearchResults", () => {
  beforeEach(() => {
    mockSongSearchUseQuery.mockReturnValue({
      data: [],
      isFetching: false,
      isError: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("clears search input on Escape before allowing the dialog to close", () => {
    const { result } = renderHook(() =>
      useSongSearchResults({ organizationId: "organization-1" }),
    );
    const escapeEvent = { preventDefault: jest.fn() };

    let handledEscape = true;
    act(() => {
      handledEscape = result.current.handleSearchEscapeKeyDown(escapeEvent);
    });

    expect(handledEscape).toBe(false);
    expect(escapeEvent.preventDefault).not.toHaveBeenCalled();
    expect(result.current.escapeShortcutLabel).toBe("Close");

    act(() => {
      result.current.handleInputChange("communion");
    });

    expect(result.current.searchInput).toBe("communion");
    expect(result.current.escapeShortcutLabel).toBe("Clear");

    act(() => {
      handledEscape = result.current.handleSearchEscapeKeyDown(escapeEvent);
    });

    expect(handledEscape).toBe(true);
    expect(escapeEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(result.current.searchInput).toBe("");
    expect(result.current.escapeShortcutLabel).toBe("Close");
  });
});
