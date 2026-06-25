import { type SongKey } from "@lib/constants";
import * as Note from "@tonaljs/note";

import { type ChordRoot } from "./types";

const songKeyAccidentalToChordAccidental = (
  accidental: string | undefined,
): "#" | "b" | "" => {
  if (accidental === "sharp") {
    return "#";
  }

  if (accidental === "flat") {
    return "b";
  }

  return "";
};

export const spellSongKeyRoot = (key: SongKey): ChordRoot => {
  const [rootLetter, accidental] = key.split("_");
  const normalizedAccidental = songKeyAccidentalToChordAccidental(accidental);

  return `${rootLetter!.toUpperCase()}${normalizedAccidental}` as ChordRoot;
};

export const getSongKeySemitone = (key: SongKey): number => {
  const semitone = Note.get(spellSongKeyRoot(key)).chroma;

  if (Number.isNaN(semitone)) {
    throw new Error(`Unsupported song key: ${key}`);
  }

  return semitone;
};
