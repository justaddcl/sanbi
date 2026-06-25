import { transposeChordRoot } from "@lib/music/chords";

describe("transposeChordRoot", () => {
  it.each([
    {
      chordRoot: "C",
      semitoneDistance: 2,
      targetSongKey: "d",
      expectedChordRoot: "D",
    },
    {
      chordRoot: "D",
      semitoneDistance: -2,
      targetSongKey: "c",
      expectedChordRoot: "C",
    },
    {
      chordRoot: "C",
      semitoneDistance: 1,
      targetSongKey: "d_flat",
      expectedChordRoot: "Db",
    },
    {
      chordRoot: "C",
      semitoneDistance: 6,
      targetSongKey: "f_sharp",
      expectedChordRoot: "F#",
    },
    {
      chordRoot: "B",
      semitoneDistance: 1,
      targetSongKey: "c",
      expectedChordRoot: "C",
    },
  ] as const)(
    "transposes $chordRoot by $semitoneDistance semitones",
    ({ chordRoot, semitoneDistance, targetSongKey, expectedChordRoot }) => {
      expect(
        transposeChordRoot({
          root: chordRoot,
          semitoneDistance,
          targetKey: targetSongKey,
        }),
      ).toBe(expectedChordRoot);
    },
  );
});
