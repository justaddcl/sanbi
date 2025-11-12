import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { songKeys } from "@lib/constants";
import { songNameRegex } from "@lib/constants/regex";
import { formatNumber } from "@lib/numbers/formatNumber";
import { sanitizeInput } from "@lib/string";
import {
  organizationMemberships,
  organizations,
  resources,
  sets,
  setSections,
  setSectionSongs,
  setSectionTypes,
  songs,
  songTags,
  tags,
} from "@server/db/schema";

/**
 * Constants
 */
export const MAX_SONG_NAME_LENGTH = 100;
export const MAX_SONG_NOTES_LENGTH = 1000;

export const dateRangeSchema = z.object({
  from: z.date(),
  to: z.date().nullish(),
});

/**
 * Organization schemas
 */
export const organizationInputSchema = z.object({
  organizationId: z.string().uuid(),
});
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
export const getInfiniteSetsSchema = z.object({
  cursor: z
    .object({
      date: z.date(),
      id: z.string().uuid(),
    })
    .nullish(),
  limit: z.number().min(1).max(48).default(10),
  eventTypeFilters: z.array(z.string().uuid()).optional(),
  dateRange: dateRangeSchema.nullish(),
});
export const insertSetSchema = createInsertSchema(sets);
const setIdSchema = z.object({
  setId: z.string().uuid(),
});
export const archiveSetSchema = setIdSchema;
export const unarchiveSetSchema = setIdSchema;
export const deleteSetSchema = setIdSchema;
export const updateSetDetailsSchema = z.object({
  ...setIdSchema.shape,
  date: z.date(),
  eventTypeId: z.string().uuid(),
});
export const updateSetNotesSchema = z.object({
  ...setIdSchema.shape,
  notes: z.string().trim(),
});
export const duplicateSetSchema = z.object({
  ...insertSetSchema.pick({
    date: true,
    eventTypeId: true,
    notes: true,
  }).shape,
  setToDuplicateId: z.string().uuid(),
});

/**
 * Song schemas
 */

export const songNameSchema = z
  .string()
  .min(1)
  .max(MAX_SONG_NAME_LENGTH)
  .superRefine((val, ctx) => {
    for (const char of val) {
      if (!songNameRegex.test(char)) {
        ctx.addIssue({
          code: "custom",
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
export const songUpdateNameSchema = z.object({
  ...songIdSchema.shape,
  name: songNameSchema,
});
export const songUpdateNotesSchema = z.object({
  ...createSelectSchema(songs).pick({ id: true }).shape,
  notes: z
    .string()
    .trim()
    .max(MAX_SONG_NOTES_LENGTH, {
      message: `Notes are too long. Please shorten to less than ${formatNumber(MAX_SONG_NOTES_LENGTH)} characters`,
    })
    .transform((notes) => sanitizeInput(notes)),
});
export const songUpdatePreferredKeySchema = z.object({
  ...songIdSchema.shape,
  preferredKey: z.enum(songKeys),
});
export const songUpdateFavoriteSchema = z.object({
  ...songIdSchema.shape,
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
export const getSetSectionSchema = setSectionIdSchema;
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
export const replaceSetSectionSongSongSchema = z.object({
  ...setSectionSongIdSchema.shape,
  replacementSongId: z.string().uuid(),
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

export const addAndReorderSongsSchema = z.object({
  setSectionId: z.string().uuid(),
  newSong: z.object({
    songId: z.string().uuid(),
    key: z.enum(songKeys),
    notes: z.string().optional(),
  }),
  newSongTempId: z.string(),
  orderedSongIds: z.array(z.string().uuid()).min(1),
});

/**
 * Tag schemas
 */
export const tagNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(30)
  .superRefine((val, ctx) => {
    // Fast path: validate entire string with one regex test
    const validPattern =
      /^(?=.*\S)[\p{L}\p{N}_'\-\p{Extended_Pictographic} ]+$/u;
    if (validPattern.test(val)) {
      return; // Valid string, exit early
    }

    // If we're here, the string is invalid - let's find out why

    // Check if there's at least one non-whitespace character
    if (!/\S/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Tag must contain at least one non-whitespace character.`,
        fatal: true,
      });
      return z.NEVER;
    }

    // Find the first invalid character (using proper Unicode handling)
    // This correctly handles surrogate pairs and emojis
    const chars = Array.from(val);
    const charPattern = /^[\p{L}\p{N}_'\-\p{Extended_Pictographic} ]$/u;

    for (const char of chars) {
      if (!charPattern.test(char)) {
        ctx.addIssue({
          code: "custom",
          message: `Tag contains invalid character: ${char}. Tags may only contain letters, numbers, spaces, underscores (_), hyphens (-), apostrophes (') or emojis.`,
          fatal: true,
        });
        return z.NEVER;
      }
    }
  });

export const getTagsByOrganizationSchema = z.object({
  organizationId: z.string().uuid(),
});
export const createTagSchema = z.object({
  ...createInsertSchema(tags).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    tag: true,
  }).shape,
  tag: tagNameSchema,
});

/**
 * Song tag schemas
 */
export const getSongTagsBySongIdSchema = z.object({
  songId: z.string().uuid(),
});
export const createSongTagSchema = createInsertSchema(songTags).omit({
  createdAt: true,
  updatedAt: true,
});
export const deleteSongTagSchema = z.object({
  songId: z.string().uuid(),
  tagId: z.string().uuid(),
});

/**
 * Resource schemas
 */
export const insertResourceSchema = createInsertSchema(resources).pick({
  organizationId: true,
  songId: true,
  url: true,
  title: true,
});
export const deleteResourceSchema = z.object({
  resourceId: z.string().uuid(),
});
