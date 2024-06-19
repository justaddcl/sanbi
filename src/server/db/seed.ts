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
import {
  eventTypes,
  organizationMembers,
  organizations,
  setSectionTypes,
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
  type Tag,
} from "@lib/types/db";
import { faker } from "@faker-js/faker";
import { generateRandomNumber } from "@/lib/numbers";

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
  db = VercelDrizzle(sql);
}

const getRandomTags = (tags: Tag[], count: number): Tag[] => {
  const randomTags: Tag[] = [];
  const tagsCopy = [...tags];

  for (let index = 0; index <= count; index++) {
    const randomIndex = generateRandomNumber(tagsCopy.length - 1);
    const [removedTag] = tagsCopy.splice(randomIndex, 1);
    tagsCopy.push(removedTag!);
  }

  return randomTags;
};

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
const seed = async () => {
  console.log("🌱 Seeding database...");

  const [organization] = await db
    .insert(organizations)
    .values(seedOrganization)
    .onConflictDoNothing()
    .returning();

  const [user] = await db.insert(users).values(seedUser).returning();

  const seededEventTypes = await db
    .insert(eventTypes)
    .values(seedEventTypes)
    .onConflictDoNothing()
    .returning();

  const seededSectionTypes = await db
    .insert(setSectionTypes)
    .values(seedSetSectionTypes)
    .onConflictDoNothing()
    .returning();

  const seededTags = await db.insert(tags).values(seedTags).returning();

  const orgMembership = await db
    .insert(organizationMembers)
    .values({
      userId: user?.id,
      organizationId: organization?.id,
      permissionType: "admin",
    })
    .onConflictDoNothing()
    .returning();

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

  const [
    inMyPlace,
    suchAnAwesomeGod,
    iLoveYouLordMashUp,
    refuge,
    sonOfSuffering,
    drawMeCloseToYou,
    romans24,
    onlyJesus,
    godOverEverything,
  ] = await db
    .insert(songs)
    .values(seedSongs)
    .onConflictDoNothing()
    .returning();
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
