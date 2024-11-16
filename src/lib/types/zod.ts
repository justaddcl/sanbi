import {
  organizationMemberships,
  organizations,
  sets,
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
