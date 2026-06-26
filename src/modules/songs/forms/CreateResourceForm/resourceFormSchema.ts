import type * as z from "zod";

import { insertResourceSchema } from "@lib/types/zod";

export const resourceFormSchema = insertResourceSchema.pick({
  title: true,
  url: true,
});

export type ResourceFormFields = z.infer<typeof resourceFormSchema>;
