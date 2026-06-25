import { songKeys } from "@lib/constants";
import { isSupportedSongKey } from "@lib/music/chords";

describe("isSupportedSongKey", () => {
  it.each(songKeys)("returns true for Sanbi song key %s", (songKey) => {
    expect(isSupportedSongKey(songKey)).toBe(true);
  });

  it("returns false for unsupported runtime values", () => {
    expect(isSupportedSongKey("unsupported")).toBe(false);
  });
});
