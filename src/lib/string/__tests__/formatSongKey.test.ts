import { songKeys } from "@lib/constants";
import { formatSongKey } from "@lib/string/formatSongKey";

describe("formatSongKey lib function", () => {
  it.each(songKeys)("correctly formats %s", (key) => {
    const formattedKey = formatSongKey(key);

    if (key.includes("sharp")) {
      expect(formattedKey).toContain("♯");
      expect(formattedKey).not.toContain("sharp");
    }

    if (key.includes("flat")) {
      expect(formattedKey).toContain("♭");
      expect(formattedKey).not.toContain("flat");
    }

    expect(formattedKey[0]).toBe(formattedKey[0]!.toUpperCase()); // since the input is typed to SongKey, formatSongKey shouldn't return anything that  doesn't have a first character
  });
});
