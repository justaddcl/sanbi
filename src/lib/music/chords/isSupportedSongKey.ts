import { type SongKey, songKeys } from "@lib/constants";

export const isSupportedSongKey = (key: string): key is SongKey =>
  (songKeys as readonly string[]).includes(key);
