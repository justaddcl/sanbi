import { and, eq, gt, gte, sql } from "drizzle-orm";

import { type NewSetSectionSong } from "@lib/types";
import { type db } from "@server/db";
import { setSections, setSectionSongs, songs } from "@server/db/schema";

import { type SetSectionSongDataAccess } from "./setSectionSongMutations";

type SetSectionSongDatabase = Pick<
  typeof db,
  "delete" | "execute" | "insert" | "query" | "update"
>;

type SetSectionSongUpdateValues = Parameters<
  SetSectionSongDataAccess["updateSetSectionSong"]
>[1];

export const createSetSectionSongDataAccess = (
  database: SetSectionSongDatabase,
): SetSectionSongDataAccess => ({
  createSetSectionSong: async (setSectionSong: NewSetSectionSong) => {
    const [createdSetSectionSong] = await database
      .insert(setSectionSongs)
      .values(setSectionSong)
      .returning();

    return createdSetSectionSong ?? null;
  },
  deleteSetSectionSong: async (setSectionSongId: string) => {
    const [deletedSetSectionSong] = await database
      .delete(setSectionSongs)
      .where(eq(setSectionSongs.id, setSectionSongId))
      .returning();

    return deletedSetSectionSong ?? null;
  },
  findAdjacentSetSection: async (setId: string, position: number) => {
    return (
      (await database.query.setSections.findFirst({
        where: and(
          eq(setSections.setId, setId),
          eq(setSections.position, position),
        ),
      })) ?? null
    );
  },
  findSetSectionById: async (setSectionId: string) => {
    return (
      (await database.query.setSections.findFirst({
        where: eq(setSections.id, setSectionId),
      })) ?? null
    );
  },
  findSetSectionSongById: async (setSectionSongId: string) => {
    return (
      (await database.query.setSectionSongs.findFirst({
        where: eq(setSectionSongs.id, setSectionSongId),
        with: {
          setSection: true,
        },
      })) ?? null
    );
  },
  findSetSectionSongsBySetSectionId: async (setSectionId: string) => {
    return await database.query.setSectionSongs.findMany({
      where: eq(setSectionSongs.setSectionId, setSectionId),
    });
  },
  findSongById: async (songId: string) => {
    return (
      (await database.query.songs.findFirst({
        where: eq(songs.id, songId),
      })) ?? null
    );
  },
  lockSetSectionForUpdate: async (setSectionId: string) => {
    await database.execute(
      sql`SELECT id FROM ${setSections} WHERE ${setSections.id} = ${setSectionId} FOR UPDATE`,
    );
  },
  shiftSetSectionSongPositionsFrom: async (
    setSectionId: string,
    position: number,
    offset: -1 | 1,
  ) => {
    await database
      .update(setSectionSongs)
      .set({
        position: sql`${setSectionSongs.position} + ${offset}`,
      })
      .where(
        and(
          eq(setSectionSongs.setSectionId, setSectionId),
          offset === 1
            ? gte(setSectionSongs.position, position)
            : gt(setSectionSongs.position, position - 1),
        ),
      );
  },
  updateSetSectionSong: async (
    setSectionSongId: string,
    updates: SetSectionSongUpdateValues,
  ) => {
    const [updatedSetSectionSong] = await database
      .update(setSectionSongs)
      .set(updates)
      .where(eq(setSectionSongs.id, setSectionSongId))
      .returning();

    return updatedSetSectionSong ?? null;
  },
});
