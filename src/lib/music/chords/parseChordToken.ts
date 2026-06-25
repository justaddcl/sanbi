import { parseChordPart } from "./parseChordPart";
import { type ParsedChordToken } from "./types";

export const parseChordToken = (token: string): ParsedChordToken | null => {
  if (token.length === 0 || token.trim() !== token) {
    return null;
  }

  const [chordPart, bassPart, ...extraSlashParts] = token.split("/");

  if (!chordPart || extraSlashParts.length > 0) {
    return null;
  }

  const chord = parseChordPart(chordPart);

  if (!chord) {
    return null;
  }

  if (bassPart === undefined) {
    return {
      token,
      root: chord.root,
      suffix: chord.suffix,
      bass: null,
    };
  }

  const bass = parseChordPart(bassPart);

  if (!bass) {
    return null;
  }

  return {
    token,
    root: chord.root,
    suffix: chord.suffix,
    bass,
  };
};
