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
import { sql as vercelSql } from "@vercel/postgres";
import {
  eventTypes,
  organizationMembers,
  organizations,
  setSectionSongs,
  setSectionTypes,
  setSections,
  sets,
  songTags,
  songs,
  tags,
  users,
} from "./schema";
import {
  type NewOrganizationMembership,
  type NewOrganization,
  type NewUser,
  type NewEventType,
  type NewSetSectionType,
  type NewTag,
  type NewSong,
  type NewSongTag,
  type NewSet,
  type NewSetSection,
  type NewSetSectionSong,
  type SetSection,
} from "@lib/types/db";
import { faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";
import { getRandomValues } from "@/lib/array";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

let db:
  | PostgresJsDatabase<Record<string, never>>
  | VercelPgDatabase<Record<string, never>>;

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);

if (env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
  const queryClient = postgres(env.LOCAL_DATABASE_URL);
  db = LocalDrizzle(queryClient);
} else {
  db = VercelDrizzle(vercelSql);
}

const TAGS_PER_SONG_SEED_COUNT = 3;
const SONGS_PER_SET_SECTION_COUNT = 3;

const seedOrganization: NewOrganization = {
  name: "Stoneway",
  slug: "stoneway",
};

const seedUser: NewUser = {
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
};

const seedEventTypes: NewEventType[] = [
  { event: "Sunday service" },
  { event: "Team Stoneway" },
  { event: "Discipleship Community" },
];

const seedSetSectionTypes: NewSetSectionType[] = [
  { section: "Full band" },
  { section: "Prayer" },
  { section: `Lord's Supper` },
];

const seedTags: NewTag[] = [
  { tag: "God's love" },
  { tag: "God's sovereignty" },
  { tag: "Easter" },
  { tag: "Christmas" },
  { tag: "The cross" },
  { tag: "Grace" },
  { tag: "Forgiveness" },
];

/**
 * We disable the @typescript-eslint/no-unsafe-argument rule for seeding
 * since using the inferred drizzle insert types leads to "Unsafe argument
 * of type `any` assigned to a parameter of type errors". Not sure why 🤷🏻‍♂️
 */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

/**
 * We disable the rule to enforce delete with where since we want to delete
 * all existing rows as we're just seeding the database
 */
/* eslint-disable drizzle/enforce-delete-with-where */
const seed = async () => {
  console.log("🌱 Seeding database...");

  /** seed the organization table */
  await db.execute(sql`TRUNCATE TABLE sanbi_organizations CASCADE`);
  await db.execute(
    sql`ALTER SEQUENCE public.sanbi_organizations_id_seq RESTART WITH 1;`,
  );
  const [organization] = await db
    .insert(organizations)
    .values(seedOrganization)
    .onConflictDoNothing()
    .returning();
  console.log("🚀 ~ seed ~ organization:", organization);

  /** seed the users table */
  await db.execute(sql`TRUNCATE TABLE sanbi_users CASCADE`);
  await db.execute(
    sql`ALTER SEQUENCE public.sanbi_user_id_seq RESTART WITH 1;`,
  );
  const [user] = await db.insert(users).values(seedUser).returning();
  console.log("🚀 ~ seed ~ user:", user);

  /** seed the organisation members table */
  await db.execute(sql`TRUNCATE TABLE sanbi_organization_memberships CASCADE`);
  const newOrgMembership: NewOrganizationMembership = {
    userId: user?.id,
    organizationId: organization?.id,
    permissionType: "admin",
  };
  const orgMembership = await db
    .insert(organizationMembers)
    .values(newOrgMembership)
    .onConflictDoNothing()
    .returning();
  console.log("🚀 ~ seed ~ orgMembership:", orgMembership);

  /** seed the event types table */
  await db.execute(sql`TRUNCATE TABLE sanbi_event_types CASCADE`);
  await db.execute(
    sql`ALTER SEQUENCE public.sanbi_event_types_id_seq RESTART WITH 1;`,
  );
  const seededEventTypes = await db
    .insert(eventTypes)
    .values(seedEventTypes)
    .onConflictDoNothing()
    .returning();
  console.log("🚀 ~ seed ~ seededEventTypes:", seededEventTypes);

  /** seed the section types table */
  await db.execute(sql`TRUNCATE TABLE sanbi_set_section_types CASCADE`);
  await db.execute(
    sql`ALTER SEQUENCE public.sanbi_set_section_types_id_seq RESTART WITH 1;`,
  );
  const seededSectionTypes = await db
    .insert(setSectionTypes)
    .values(seedSetSectionTypes)
    .onConflictDoNothing()
    .returning();
  console.log("🚀 ~ seed ~ seededSectionTypes:", seededSectionTypes);

  /** seed the tags table */
  await db.execute(sql`TRUNCATE TABLE sanbi_tags CASCADE`);
  await db.execute(
    sql`ALTER SEQUENCE public.sanbi_tags_id_seq RESTART WITH 1;`,
  );
  const seededTags = await db.insert(tags).values(seedTags).returning();
  console.log("🚀 ~ seed ~ seededTags:", seededTags);

  /** seed the songs table */
  await db.execute(sql`TRUNCATE TABLE sanbi_songs CASCADE`);
  await db.execute(
    sql`ALTER SEQUENCE public.sanbi_song_id_seq RESTART WITH 1;`,
  );
  const seedSongs: NewSong[] = [
    {
      name: "In My Place",
      key: "b",
      notes:
        "Play in the key of B to make it easier for the backup vocalist to harmonize with.",
      createdBy: user!.id,
      organizationId: organization!.id,
    },
    {
      name: "Such An Awesome God",
      key: "a",
      createdBy: user!.id,
      organizationId: organization!.id,
    },
    {
      name: "I Love YouLord/What A Beautiful Name (mash up)",
      key: "g",
      notes:
        "Song is best with only vocals, guitar, and keys. Feels powerful with only vocals on the last chorus.",
      createdBy: user!.id,
      organizationId: organization!.id,
    },
    {
      name: "Refuge",
      key: "g",
      createdBy: user!.id,
      organizationId: organization!.id,
    },
    {
      name: "Son Of Suffering",
      key: "g",
      notes: "Don't play the second chorus or chorus 2.",
      createdBy: user!.id,
      organizationId: organization!.id,
    },
    {
      name: "Draw Me Close To You",
      key: "c",
      createdBy: user!.id,
      organizationId: organization!.id,
    },
    {
      name: "Romans 2:4",
      key: "g",
      createdBy: user!.id,
      organizationId: organization!.id,
    },
    {
      name: "Only Jesus",
      key: "g",
      notes: "Skip the tag if not playing with full band.",
      createdBy: user!.id,
      organizationId: organization!.id,
    },
    {
      name: "God Over Everything",
      key: "g",
      createdBy: user!.id,
      organizationId: organization!.id,
    },
  ];

  const seededSongs = await db
    .insert(songs)
    .values(seedSongs)
    .onConflictDoNothing()
    .returning();
  console.log("🚀 ~ seed ~ seededSongs:", seededSongs);

  /** seed the song tags table */
  await db.execute(sql`TRUNCATE TABLE sanbi_song_tags CASCADE`);
  const insertSongTagsPromises = seededSongs.map(async (song) => {
    const tags = getRandomValues(seededTags, TAGS_PER_SONG_SEED_COUNT);

    const songTagValues = tags.map<NewSongTag>((tag) => ({
      tagId: tag.id,
      songId: song.id,
    }));

    await db.insert(songTags).values(songTagValues).onConflictDoNothing();
  });

  const [seededSongTags] = await Promise.all(insertSongTagsPromises);
  console.log("🚀 ~ seed ~ seededSongTags:", seededSongTags);

  /** seed the sets table */
  await db.execute(sql`TRUNCATE TABLE sanbi_sets CASCADE`);
  await db.execute(
    sql`ALTER SEQUENCE public.sanbi_sets_id_seq RESTART WITH 1;`,
  );
  const seedSets: NewSet[] = [
    {
      eventTypeId: seededEventTypes[0]!.id,
      date: "2024-09-30",
    },
    {
      eventTypeId: seededEventTypes[1]!.id,
      date: "2024-08-17",
    },
    {
      eventTypeId: seededEventTypes[2]!.id,
      date: "2024-08-14",
    },
  ];

  const seededSets = await db
    .insert(sets)
    .values(seedSets)
    .onConflictDoNothing()
    .returning();
  console.log("🚀 ~ seed ~ seededSets:", seededSets);

  /** seed the set sections table */
  await db.execute(sql`TRUNCATE TABLE sanbi_set_sections CASCADE`);
  await db.execute(
    sql`ALTER SEQUENCE public.sanbi_set_sections_id_seq RESTART WITH 1;`,
  );
  const insertSetSectionsPromises = seededSets.map(async (set) => {
    const seedSetSections = seededSectionTypes.map<NewSetSection>(
      (sectionType, index) => ({
        setId: set.id,
        position: index,
        sectionTypeId: sectionType.id,
      }),
    );

    return await db
      .insert(setSections)
      .values(seedSetSections)
      .onConflictDoNothing()
      .returning();
  });

  const seededSetSections = await Promise.all(insertSetSectionsPromises);
  console.log("🚀 ~ seed ~ seededSetSections:", seededSetSections);

  /** seed the set section songs table */
  await db.execute(sql`TRUNCATE TABLE sanbi_set_section_songs CASCADE`);

  const createSeedForSetSection = async (
    setSection: SetSection,
  ): Promise<NewSetSectionSong[]> => {
    const randomSongs = getRandomValues(
      seededSongs,
      SONGS_PER_SET_SECTION_COUNT,
    );

    const setSectionSongValues = randomSongs.map<NewSetSectionSong>(
      (song, index) => ({
        setSectionId: setSection.id,
        songId: song.id,
        position: index,
      }),
    );

    return db
      .insert(setSectionSongs)
      .values(setSectionSongValues)
      .onConflictDoNothing()
      .returning();
  };

  const createSeedForSet = (
    setSections: SetSection[],
  ): Promise<NewSetSectionSong[]>[] =>
    setSections.map((setSection) => createSeedForSetSection(setSection));

  const seedPromises = seededSetSections.map((setSections) =>
    createSeedForSet(setSections),
  );

  const flattenedPromises = seedPromises.flat();

  const seededSetSectionSongs = await Promise.all(flattenedPromises);
  console.log("🚀 ~ seed ~ seededSetSectionSongs:", seededSetSectionSongs);
};

seed()
  .catch((error) => {
    console.error(
      "⚠️ A problem appears to have occurred during seeding",
      error,
    );
    process.exit(1);
  })
  .finally(() => {
    console.log("🌲 Seeding completed");
    process.exit(0);
  });
