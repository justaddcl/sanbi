import { organizationMemberships, organizations } from "@/server/db/schema";
import { createInsertSchema } from "drizzle-zod";

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

export const insertOrganizationMembershipSchema = createInsertSchema(
  organizationMemberships,
);
