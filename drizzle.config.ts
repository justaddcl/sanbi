import { type Config } from "drizzle-kit";

import { resolveDatabaseUrl } from "@server/db/resolveDatabaseUrl";
import { env } from "@/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: resolveDatabaseUrl(env),
  },
  tablesFilter: ["sanbi_*"],
} satisfies Config;
