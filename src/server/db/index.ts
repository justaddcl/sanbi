import {
  drizzle as LocalDrizzle,
  type PostgresJsDatabase,
} from "drizzle-orm/postgres-js";
import {
  drizzle as VercelDrizzle,
  type VercelPgDatabase,
} from "drizzle-orm/vercel-postgres";
import postgres from "postgres";

import { env } from "@/env";
import { sql } from "@vercel/postgres";
import * as schema from "@server/db/schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

let db: PostgresJsDatabase<typeof schema> | VercelPgDatabase<typeof schema>;

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
if (env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
  const queryClient = postgres(env.DATABASE_URL, {
    max: 5,
  });
  db = LocalDrizzle(queryClient, { schema });
} else {
  db = VercelDrizzle(sql, { schema });
}

export { db };
