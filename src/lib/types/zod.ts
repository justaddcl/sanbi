import { organizations } from "@/server/db/schema";
import { createInsertSchema } from "drizzle-zod";

export const insertOrganizationSchema = createInsertSchema(organizations);
