import { getTransposeSemitoneDistance } from "@lib/music/chords";

describe("getTransposeSemitoneDistance", () => {
  it.each([
    [{ sourceKey: "c", targetKey: "d", expected: 2 }],
    [{ sourceKey: "d", targetKey: "c", expected: 10 }],
    [{ sourceKey: "b_flat", targetKey: "c", expected: 2 }],
    [{ sourceKey: "c_sharp", targetKey: "e_flat", expected: 2 }],
  ] as const)(
    "returns the normalized semitone distance from $sourceKey to $targetKey",
    ({ sourceKey, targetKey, expected }) => {
      expect(getTransposeSemitoneDistance({ sourceKey, targetKey })).toBe(
        expected,
      );
    },
  );
});
