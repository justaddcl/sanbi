import { transposeChordToken } from "@lib/music/chords";

describe("transposeChordToken", () => {
  it.each([
    [
      "transposes a major chord",
      { token: "C", sourceKey: "c", targetKey: "d", expected: "D" },
    ],
    [
      "transposes a minor chord while preserving the suffix",
      { token: "Am", sourceKey: "c", targetKey: "d", expected: "Bm" },
    ],
    [
      "transposes a slash chord",
      { token: "D/F#", sourceKey: "d", targetKey: "e", expected: "E/G#" },
    ],
    [
      "transposes a flat root",
      { token: "Bb", sourceKey: "b_flat", targetKey: "c", expected: "C" },
    ],
    [
      "preserves complex suffix text and transposes slash bass",
      {
        token: "C#m7/G#",
        sourceKey: "c_sharp",
        targetKey: "e_flat",
        expected: "Ebm7/Bb",
      },
    ],
    [
      "preserves major seventh suffixes",
      {
        token: "Fmaj7",
        sourceKey: "f",
        targetKey: "g_flat",
        expected: "Gbmaj7",
      },
    ],
    [
      "uses flat spellings for flat target keys",
      { token: "C", sourceKey: "c", targetKey: "d_flat", expected: "Db" },
    ],
    [
      "uses sharp spellings for sharp target keys",
      { token: "C", sourceKey: "c", targetKey: "f_sharp", expected: "F#" },
    ],
  ] as const)(
    "%s",
    (_description, { token, sourceKey, targetKey, expected }) => {
      expect(
        transposeChordToken({
          token,
          sourceKey,
          targetKey,
        }).transposedToken,
      ).toBe(expected);
    },
  );

  it("returns unsupported tokens unchanged", () => {
    expect(
      transposeChordToken({
        token: "N.C.",
        sourceKey: "c",
        targetKey: "d",
      }).transposedToken,
    ).toBe("N.C.");

    expect(
      transposeChordToken({
        token: "God",
        sourceKey: "c",
        targetKey: "d",
      }).transposedToken,
    ).toBe("God");
  });

  it("returns tokens unchanged for unsupported keys passed at runtime", () => {
    expect(
      transposeChordToken({
        token: "C",
        sourceKey: "unsupported",
        targetKey: "d",
      }).transposedToken,
    ).toBe("C");

    expect(
      transposeChordToken({
        token: "C",
        sourceKey: "c",
        targetKey: "unsupported",
      }).transposedToken,
    ).toBe("C");
  });

  it("returns review metadata for ambiguous chord-like tokens", () => {
    expect(
      transposeChordToken({
        token: "am",
        sourceKey: "c",
        targetKey: "d",
      }),
    ).toEqual({
      originalToken: "am",
      transposedToken: "Bm",
      wasTransposed: true,
      status: "transposed",
      requiresReview: true,
      reviewReasons: ["lowercase-root"],
    });

    expect(
      transposeChordToken({
        token: "A",
        sourceKey: "c",
        targetKey: "d",
      }),
    ).toEqual({
      originalToken: "A",
      transposedToken: "B",
      wasTransposed: true,
      status: "transposed",
      requiresReview: true,
      reviewReasons: ["bare-root"],
    });
  });

  it("does not report same-key normalization as transposition", () => {
    expect(
      transposeChordToken({
        token: "am",
        sourceKey: "c",
        targetKey: "c",
      }),
    ).toEqual({
      originalToken: "am",
      transposedToken: "Am",
      wasTransposed: false,
      status: "transposed",
      requiresReview: true,
      reviewReasons: ["lowercase-root"],
    });
  });

  it("returns unchanged metadata for unsupported tokens", () => {
    expect(
      transposeChordToken({
        token: "God",
        sourceKey: "c",
        targetKey: "d",
      }),
    ).toEqual({
      originalToken: "God",
      transposedToken: "God",
      wasTransposed: false,
      status: "unsupported-token",
      requiresReview: false,
      reviewReasons: [],
    });
  });
});
