import { sql } from "drizzle-orm";

import { logger } from "@lib/loggers/logger";
import { db } from "@/server/db";

const clear = async () => {
  logger.info("🧹 Clearing database...");

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
    logger.error(
      "⚠️ A problem appears to have occurred during clearing",
      error,
    );
    process.exit(1);
  })
  .finally(() => {
    logger.info("✨ Clearing completed");
    process.exit(0);
  });
