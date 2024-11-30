import { type SongKey } from "@lib/constants";
import { capitalize } from "./capitalize";

export const formatSongKey = (key: SongKey): string => {
  const [root, accidental] = key.split("_");

  // we use the non-null assertion here since key is typed and shouldn't ever not have a root
  return accidental
    ? `${capitalize(root!)}${accidental.replace("sharp", "♯").replace("flat", "♭")}`
    : capitalize(root!);
};
