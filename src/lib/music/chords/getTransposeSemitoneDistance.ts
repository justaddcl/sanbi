import { type SongKey } from "@lib/constants";
import * as Interval from "@tonaljs/interval";
import * as Note from "@tonaljs/note";

import { spellSongKeyRoot } from "./getSongKeySemitone";
import { modulo } from "./modulo";

export const getTransposeSemitoneDistance = ({
  sourceKey,
  targetKey,
}: {
  sourceKey: SongKey;
  targetKey: SongKey;
}): number =>
  modulo(
    Interval.semitones(
      Note.distance(spellSongKeyRoot(sourceKey), spellSongKeyRoot(targetKey)),
    ),
    12,
  );
