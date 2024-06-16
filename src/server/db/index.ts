import {
  drizzle as LocalDrizzle,
  type PostgresJsDatabase,
} from "drizzle-orm/postgres-js";
import { migrate as LocalMigrate } from "drizzle-orm/postgres-js/migrator";
import {
  drizzle as VercelDrizzle,
  type VercelPgDatabase,
} from "drizzle-orm/vercel-postgres";
import { migrate as VercelMigrate } from "drizzle-orm/vercel-postgres/migrator";
import postgres from "postgres";

import { env } from "@/env";
import { sql } from "@vercel/postgres";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const MIGRATIONS_DIR = "./migrations";

let db:
  | PostgresJsDatabase<Record<string, never>>
  | VercelPgDatabase<Record<string, never>>;

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
if (env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
  const migrationClient = postgres(env.LOCAL_DATABASE_URL, { max: 1 });
  const queryClient = postgres(env.LOCAL_DATABASE_URL);
  db = LocalDrizzle(queryClient);
  await LocalMigrate(db, { migrationsFolder: MIGRATIONS_DIR });
  await migrationClient.end();
} else {
  db = VercelDrizzle(sql);
  await VercelMigrate(db, { migrationsFolder: MIGRATIONS_DIR });
}

export { db };
