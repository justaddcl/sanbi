export type SetSongNumberingSong = {
  id: string;
  position: number;
};

export type SetSongNumberingSection<
  TSong extends SetSongNumberingSong = SetSongNumberingSong,
> = {
  id: string;
  position: number;
  songs: readonly TSong[];
};

export type NumberedSetSong<TSong extends SetSongNumberingSong> = {
  song: TSong;
  displayIndex: number;
};

export type NumberedSetSection<TSection extends SetSongNumberingSection> = {
  section: TSection;
  sectionStartIndex: number;
  songs: NumberedSetSong<TSection["songs"][number]>[];
};

export const getSetSongNumbering = <TSection extends SetSongNumberingSection>(
  sections: readonly TSection[],
): NumberedSetSection<TSection>[] => {
  const sectionStartIndexes = new Map<string, number>();
  let nextSectionStartIndex = 1;

  sections
    .toSorted((sectionA, sectionB) => sectionA.position - sectionB.position)
    .forEach((section) => {
      sectionStartIndexes.set(section.id, nextSectionStartIndex);
      nextSectionStartIndex += section.songs.length;
    });

  return sections.map((section) => {
    const sectionStartIndex = sectionStartIndexes.get(section.id);

    if (sectionStartIndex === undefined) {
      throw new Error(
        `Missing set section numbering for section ${section.id}`,
      );
    }

    return {
      section,
      sectionStartIndex,
      songs: section.songs.map((song) => ({
        song,
        displayIndex: sectionStartIndex + song.position,
      })),
    };
  });
};
