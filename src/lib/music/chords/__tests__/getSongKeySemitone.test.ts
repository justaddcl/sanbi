import { songKeys } from "@lib/constants";
import { getSongKeySemitone } from "@lib/music/chords";

describe("getSongKeySemitone", () => {
  it.each(songKeys)("recognizes Sanbi song key %s", (songKey) => {
    expect(getSongKeySemitone(songKey)).toEqual(expect.any(Number));
  });
});
