import { type SongKey } from "@lib/constants";
import * as Note from "@tonaljs/note";

import { FLAT_KEY_ROOTS } from "./constants/flatKeyRoots";
import { spellSongKeyRoot } from "./getSongKeySemitone";
import { modulo } from "./modulo";
import { type ChordRoot } from "./types";

const getTargetSpelling = (targetKey: SongKey) =>
  FLAT_KEY_ROOTS.has(spellSongKeyRoot(targetKey)) ? "flat" : "sharp";

const getPitchClassFromChroma = ({
  chroma,
  spelling,
}: {
  chroma: number;
  spelling: "flat" | "sharp";
}): ChordRoot => {
  const noteName =
    spelling === "flat" ? Note.fromMidi(chroma) : Note.fromMidiSharps(chroma);

  return Note.pitchClass(noteName) as ChordRoot;
};

export const transposeChordRoot = ({
  root,
  semitoneDistance,
  targetKey,
}: {
  root: ChordRoot;
  semitoneDistance: number;
  targetKey: SongKey;
}): ChordRoot => {
  const semitone = Note.get(root).chroma;

  if (Number.isNaN(semitone)) {
    throw new Error(`Unsupported chord root: ${root}`);
  }

  const transposedSemitone = modulo(semitone + semitoneDistance, 12);
  const targetSpelling = getTargetSpelling(targetKey);
  const transposedRoot = getPitchClassFromChroma({
    chroma: transposedSemitone,
    spelling: targetSpelling,
  });

  if (!transposedRoot) {
    throw new Error(`Unsupported transposed semitone: ${transposedSemitone}`);
  }

  return transposedRoot;
};
