import { songKeys } from "@lib/constants";
import { getSongKeySemitone } from "@lib/music/chords";

describe("getSongKeySemitone", () => {
  const expectedSemitones = {
    c: 0,
    c_sharp: 1,
    d_flat: 1,
    d: 2,
    d_sharp: 3,
    e_flat: 3,
    e: 4,
    f: 5,
    f_sharp: 6,
    g_flat: 6,
    g: 7,
    g_sharp: 8,
    a_flat: 8,
    a: 9,
    a_sharp: 10,
    b_flat: 10,
    b: 11,
  } as const satisfies Record<(typeof songKeys)[number], number>;

  it.each(songKeys)("recognizes Sanbi song key %s", (songKey) => {
    expect(getSongKeySemitone(songKey)).toBe(expectedSemitones[songKey]);
  });
});
