import {
  organizationMemberships,
  organizations,
  sets,
  setSections,
  setSectionSongs,
  setSectionTypes,
  songs,
} from "@server/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Organization schemas
 */
export const insertOrganizationSchema = createInsertSchema(organizations, {
  name: (schema) =>
    schema.name.min(1, {
      message: "Team name must be at least 1 character",
    }),
  slug: (schema) =>
    schema.slug.min(1, {
      message: "Team URL must be at least 1 character",
    }),
});

export const deleteOrganizationSchema = z.object({
  organizationId: z.string().uuid(),
});

export const insertOrganizationMembershipSchema = createInsertSchema(
  organizationMemberships,
);

/**
 * Set schemas
 */
export const getSetSchema = z.object({ setId: z.string().uuid() });
export const insertSetSchema = createInsertSchema(sets);

const setIdSchema = z.object({
  setId: z.string().uuid(),
});

export const archiveSetSchema = setIdSchema;

export const unarchiveSetSchema = setIdSchema;

export const deleteSetSchema = setIdSchema;

/**
 * Song schemas
 */
export const insertSongSchema = createInsertSchema(songs);

export const songIdSchema = z.object({
  songId: z.string().uuid(),
});

export const archiveSongSchema = songIdSchema;

export const unarchiveSongSchema = songIdSchema;

export const deleteSongSchema = songIdSchema;

export const searchSongSchema = z.object({
  searchInput: z.string().min(2),
});

export const songGetLastPlayInstanceSchema = songIdSchema;

/**
 * Set section type schemas
 */
export const insertSetSectionTypeSchema = createInsertSchema(setSectionTypes);

/**
 * Set section schemas
 */
export const insertSetSectionSchema = createInsertSchema(setSections);

export const getSectionsForSet = z.object({ setId: z.string().uuid() });

/**
 * Set section songs schemas
 */
const setSectionSongIdSchema = z.object({
  setSectionSongId: z.string().uuid(),
});
export const insertSetSectionSongSchema = createInsertSchema(setSectionSongs);
export const deleteSetSectionSongSchema = setSectionSongIdSchema;
export const swapSetSectionSongSchema = setSectionSongIdSchema;
export const moveSetSectionSongToAdjacentSetSectionSchema =
  setSectionSongIdSchema;
