import { createUuid } from "@testUtils/generators/createUuid";

import {
  getSetSongNumbering,
  type SetSongNumberingSection,
  type SetSongNumberingSong,
} from "../getSetSongNumbering";

const createSong = (
  overrides: Partial<SetSongNumberingSong> = {},
): SetSongNumberingSong => ({
  id: createUuid(),
  position: 0,
  ...overrides,
});

const createSection = (
  overrides: Partial<SetSongNumberingSection> = {},
): SetSongNumberingSection => ({
  id: createUuid(),
  position: 0,
  songs: [],
  ...overrides,
});

describe("getSetSongNumbering", () => {
  it("returns one-based section start indexes for empty sections", () => {
    const sections = [
      createSection({ position: 0 }),
      createSection({ position: 1 }),
    ];

    const numbering = getSetSongNumbering(sections);

    expect(numbering.map((section) => section.sectionStartIndex)).toEqual([
      1, 1,
    ]);
    expect(numbering.map((section) => section.songs)).toEqual([[], []]);
  });

  it("derives per-song display indexes across multiple sections", () => {
    const firstSectionSongs = [
      createSong({ position: 0 }),
      createSong({ position: 1 }),
    ];
    const secondSectionSongs = [
      createSong({ position: 0 }),
      createSong({ position: 1 }),
    ];
    const sections = [
      createSection({ position: 0, songs: firstSectionSongs }),
      createSection({ position: 1, songs: secondSectionSongs }),
    ];

    const numbering = getSetSongNumbering(sections);

    expect(numbering.map((section) => section.sectionStartIndex)).toEqual([
      1, 3,
    ]);
    expect(
      numbering.flatMap((section) =>
        section.songs.map((song) => song.displayIndex),
      ),
    ).toEqual([1, 2, 3, 4]);
  });

  it("keeps cumulative starts stable with mixed song counts", () => {
    const openingSongs = [createSong({ position: 0 })];
    const responseSongs = [
      createSong({ position: 0 }),
      createSong({ position: 1 }),
      createSong({ position: 2 }),
    ];
    const closingSongs = [createSong({ position: 0 })];
    const sections = [
      createSection({ position: 0, songs: openingSongs }),
      createSection({ position: 1 }),
      createSection({ position: 2, songs: responseSongs }),
      createSection({ position: 3, songs: closingSongs }),
    ];

    const numbering = getSetSongNumbering(sections);

    // Empty sections keep the next available display number as their start.
    // The following section therefore shares that start until a song consumes it.
    expect(numbering.map((section) => section.sectionStartIndex)).toEqual([
      1, 2, 2, 5,
    ]);
    expect(
      numbering.map((section) =>
        section.songs.map((song) => song.displayIndex),
      ),
    ).toEqual([[1], [], [2, 3, 4], [5]]);
  });

  it("computes section starts by position while preserving input order", () => {
    const firstSection = createSection({
      position: 0,
      songs: [createSong({ position: 0 }), createSong({ position: 1 })],
    });
    const secondSection = createSection({
      position: 1,
      songs: [createSong({ position: 0 })],
    });

    const numbering = getSetSongNumbering([secondSection, firstSection]);

    expect(numbering.map(({ section }) => section.id)).toEqual([
      secondSection.id,
      firstSection.id,
    ]);
    expect(numbering.map((section) => section.sectionStartIndex)).toEqual([
      3, 1,
    ]);
    expect(
      numbering.map((section) =>
        section.songs.map((song) => song.displayIndex),
      ),
    ).toEqual([[3], [1, 2]]);
  });
});
