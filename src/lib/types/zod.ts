import { songKeys } from "@lib/constants";
import { songNameRegex } from "@lib/constants/regex";
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
export const updateSetDetailsSchema = setIdSchema.extend({
  date: z.string().date(),
  eventTypeId: z.string().uuid(),
});
export const updateSetNotesSchema = setIdSchema.extend({
  notes: z.string().trim(),
});
export const duplicateSetSchema = insertSetSchema
  .pick({
    date: true,
    eventTypeId: true,
    notes: true,
  })
  .extend({
    setToDuplicateId: z.string().uuid(),
  });

/**
 * Song schemas
 */

export const songNameSchema = z
  .string()
  .min(1)
  .max(100)
  .superRefine((val, ctx) => {
    for (const char of val) {
      if (!songNameRegex.test(char)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid song name character: ${char}`,
          fatal: true,
        });

        return z.NEVER;
      }
    }
  });

export const songIdSchema = z.object({
  songId: z.string().uuid(),
});
export const getSongSchema = songIdSchema;
export const insertSongSchema = createInsertSchema(songs);
export const archiveSongSchema = songIdSchema;
export const unarchiveSongSchema = songIdSchema;
export const deleteSongSchema = songIdSchema;
export const searchSongSchema = z.object({
  searchInput: z.string().min(2),
});
export const songGetLastPlayInstanceSchema = songIdSchema;
export const songGetPlayHistorySchema = songIdSchema;
export const songUpdateNameSchema = songIdSchema.extend({
  name: songNameSchema,
});
export const songUpdatePreferredKeySchema = songIdSchema.extend({
  preferredKey: z.enum(songKeys),
});
export const songUpdateFavoriteSchema = songIdSchema.extend({
  isFavorite: z.boolean(),
});

/**
 * Set section type schemas
 */
export const insertSetSectionTypeSchema = createInsertSchema(setSectionTypes);

/**
 * Set section schemas
 */
export const setSectionIdSchema = z.object({
  setSectionId: z.string().uuid(),
});
export const insertSetSectionSchema = createInsertSchema(setSections);
export const getSectionsForSet = z.object({ setId: z.string().uuid() });
export const updateSetSectionType = insertSetSectionSchema
  .pick({
    id: true,
    sectionTypeId: true,
  })
  .required({
    id: true,
  });
export const swapSetSectionPositionSchema = setSectionIdSchema;
export const deleteSetSectionSchema = setSectionIdSchema;

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
export const replaceSetSectionSongSongSchema = setSectionSongIdSchema.extend({
  replacementSong: z.string().uuid(),
});
export const updateSetSectionSongSchema = insertSetSectionSongSchema
  .required({
    id: true,
  })
  .partial({
    position: true,
    setSectionId: true,
    songId: true,
  });
