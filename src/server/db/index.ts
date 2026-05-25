import {
  type PostgresJsDatabase,
  drizzle,
} from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/env";
import * as schema from "@server/db/schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn =
  globalForDb.conn ??
  postgres(env.NODE_ENV === "production" ? env.POSTGRES_URL : env.DATABASE_URL, {
    max: env.NODE_ENV === "production" ? 1 : 5,
    prepare: false,
  });

if (env.NODE_ENV === "development") {
  globalForDb.conn = conn;
}

const db: PostgresJsDatabase<typeof schema> = drizzle(conn, { schema });

export { db };
