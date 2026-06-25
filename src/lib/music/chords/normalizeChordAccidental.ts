import { type ChordAccidental } from "./types";

export const normalizeChordAccidental = (
  accidental: string | undefined,
): ChordAccidental | "" | null => {
  if (accidental === "" || accidental === undefined) {
    return "";
  }

  if (accidental === "#" || accidental === "♯") {
    return "#";
  }

  if (accidental === "b" || accidental === "♭") {
    return "b";
  }

  return null;
};
