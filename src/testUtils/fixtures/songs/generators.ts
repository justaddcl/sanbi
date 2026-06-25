import { faker } from "@faker-js/faker";

import { type SongKey, songKeys } from "@lib/constants";

export const createSongName = () => faker.music.songName();

export const createSongKey = (): SongKey =>
  faker.helpers.arrayElement(songKeys);
