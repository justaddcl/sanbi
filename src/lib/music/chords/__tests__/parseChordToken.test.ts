import { parseChordToken } from "@lib/music/chords";

describe("parseChordToken", () => {
  it.each([
    ["C", "C", "", null],
    ["D/F#", "D", "", { root: "F#", suffix: "" }],
    ["Bb", "Bb", "", null],
    ["C#m7/G#", "C#", "m7", { root: "G#", suffix: "" }],
    ["Fmaj7", "F", "maj7", null],
    ["am", "A", "m", null],
    ["Eb/G", "Eb", "", { root: "G", suffix: "" }],
    ["Cb/E#", "Cb", "", { root: "E#", suffix: "" }],
  ])("parses recognized chord token %s", (token, root, suffix, bass) => {
    expect(parseChordToken(token)).toEqual({
      token,
      root,
      suffix,
      bass,
    });
  });

  it("returns null for unsupported chord tokens", () => {
    expect(parseChordToken("N.C.")).toBeNull();
    expect(parseChordToken("H7")).toBeNull();
    expect(parseChordToken("God")).toBeNull();
    expect(parseChordToken("Amazing")).toBeNull();
    expect(parseChordToken(" C ")).toBeNull();
    expect(parseChordToken("C/G/B")).toBeNull();
    expect(parseChordToken("C/")).toBeNull();
  });
});
