import * as Note from "@tonaljs/note";

import { normalizeChordAccidental } from "./normalizeChordAccidental";
import { type ChordRoot, type ParsedChordBass } from "./types";

const CHORD_PART_PATTERN = /^([A-Ga-g])([#b♯♭]?)(.*)$/;
const CHORD_SUFFIX_PATTERN =
  /^(?:(?:add|alt|aug|dim|maj|min|no|omit|sus)|[mM]|[#b♯♭+\-°øΔ(),\d])*$/;

export const parseChordPart = (part: string): ParsedChordBass | null => {
  const match = CHORD_PART_PATTERN.exec(part);

  if (!match) {
    return null;
  }

  const [, rootLetter, rawAccidental, suffix = ""] = match;
  const accidental = normalizeChordAccidental(rawAccidental ?? "");

  if (!rootLetter || accidental === null) {
    return null;
  }

  const root = `${rootLetter.toUpperCase()}${accidental}` as ChordRoot;

  if (Note.get(root).empty) {
    return null;
  }

  if (!CHORD_SUFFIX_PATTERN.test(suffix)) {
    return null;
  }

  return {
    root,
    suffix,
  };
};
