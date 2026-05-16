import { getDisplayUrl } from "../getDisplayUrl";

describe("getDisplayUrl", () => {
  it("returns the hostname for a valid URL", () => {
    expect(getDisplayUrl("https://example.com/song-sheet")).toBe("example.com");
  });

  it("returns the original value and reports parse failures when configured", () => {
    const onParseError = jest.fn();

    expect(getDisplayUrl("not a url", { onParseError })).toBe("not a url");
    expect(onParseError).toHaveBeenCalledTimes(1);
  });
});
