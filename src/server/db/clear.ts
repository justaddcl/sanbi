import {
  drizzle as LocalDrizzle,
  type PostgresJsDatabase,
} from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/env";
import { sql } from "drizzle-orm";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

let db: PostgresJsDatabase<Record<string, never>>;

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);

if (env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
  const queryClient = postgres(env.DATABASE_URL);
  db = LocalDrizzle(queryClient);
}

const clear = async () => {
  console.log("🧹 Clearing database...");

  /** clear the organization table */
  await db.execute(sql`TRUNCATE TABLE sanbi_organizations CASCADE`);

  /** clear the users table */
  await db.execute(sql`TRUNCATE TABLE sanbi_users CASCADE`);

  /** clear the organisation members table */
  await db.execute(sql`TRUNCATE TABLE sanbi_organization_memberships CASCADE`);

  /** clear the event types table */
  await db.execute(sql`TRUNCATE TABLE sanbi_event_types CASCADE`);

  /** clear the section types table */
  await db.execute(sql`TRUNCATE TABLE sanbi_set_section_types CASCADE`);

  /** clear the tags table */
  await db.execute(sql`TRUNCATE TABLE sanbi_tags CASCADE`);

  /** clear the songs table */
  await db.execute(sql`TRUNCATE TABLE sanbi_songs CASCADE`);

  /** clear the song tags table */
  await db.execute(sql`TRUNCATE TABLE sanbi_song_tags CASCADE`);

  /** clear the sets table */
  await db.execute(sql`TRUNCATE TABLE sanbi_sets CASCADE`);

  /** clear the set sections table */
  await db.execute(sql`TRUNCATE TABLE sanbi_set_sections CASCADE`);

  /** clear the set section songs table */
  await db.execute(sql`TRUNCATE TABLE sanbi_set_section_songs CASCADE`);
};

clear()
  .catch((error) => {
    console.error(
      "⚠️ A problem appears to have occurred during clearing",
      error,
    );
    process.exit(1);
  })
  .finally(() => {
    console.log("✨ Clearing completed");
    process.exit(0);
  });
