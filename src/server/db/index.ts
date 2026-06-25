import {
  drizzle,
  type PostgresJsDatabase,
} from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { resolveDatabaseUrl } from "@server/db/resolveDatabaseUrl";
import * as schema from "@server/db/schema";
import { env } from "@/env";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn =
  globalForDb.conn ??
  postgres(resolveDatabaseUrl(env), {
    max: 5,
    prepare: false,
  });

if (env.NODE_ENV === "development") {
  globalForDb.conn = conn;
}

const db: PostgresJsDatabase<typeof schema> = drizzle(conn, { schema });

export { db };
