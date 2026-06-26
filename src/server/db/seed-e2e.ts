import { e2eData, e2eIds } from "@testUtils/e2e/fixtures";
import { sql } from "drizzle-orm";
import { pathToFileURL } from "node:url";
import { z } from "zod";

import { logger } from "@lib/loggers/logger";
import type {
  NewEventType,
  NewOrganization,
  NewOrganizationMembership,
  NewResource,
  NewSet,
  NewSetSection,
  NewSetSectionSong,
  NewSetSectionType,
  NewSong,
  NewSongTag,
  NewTag,
  NewUser,
  NewUserPreference,
} from "@lib/types/db";

const e2eEnvSchema = z.object({
  DATABASE_URL: z.url(),
  POSTGRES_URL: z.url(),
  E2E_CLERK_USER_EMAIL: z.email(),
  E2E_CLERK_USER_ID: z.string().min(1),
  SANBI_E2E: z.literal("1"),
});

const getE2eEnv = () => e2eEnvSchema.parse(process.env);

export const seedE2eDatabase = async () => {
  const env = getE2eEnv();

  const { db } = await import("@server/db");
  const {
    eventTypes,
    organizationMemberships,
    organizations,
    resources,
    sets,
    setSections,
    setSectionSongs,
    setSectionTypes,
    songs,
    songTags,
    tags,
    userPreferences,
    users,
  } = await import("@server/db/schema");

  logger.info("Seeding E2E database...");

  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
  await db.execute(
    sql`TRUNCATE TABLE sanbi_organizations, sanbi_users CASCADE`,
  );

  const user: NewUser = {
    id: env.E2E_CLERK_USER_ID,
    email: env.E2E_CLERK_USER_EMAIL,
    firstName: "E2E",
    lastName: "User",
  };

  const userPreference: NewUserPreference = {
    userId: env.E2E_CLERK_USER_ID,
    confirmResourceDelete: true,
  };

  const organization: NewOrganization = {
    id: e2eIds.organizationId,
    ...e2eData.organization,
  };

  const placeholderHomeOrganization: NewOrganization = {
    id: e2eIds.placeholderHomeOrganizationId,
    ...e2eData.placeholderHomeOrganization,
  };

  const membership: NewOrganizationMembership = {
    organizationId: e2eIds.organizationId,
    userId: env.E2E_CLERK_USER_ID,
    permissionType: "admin",
  };

  const eventType: NewEventType = {
    id: e2eIds.eventTypeId,
    name: e2eData.eventType.name,
    organizationId: e2eIds.organizationId,
    favoritedAt: new Date("2099-01-01T00:00:00.000Z"),
  };

  const sectionTypes: NewSetSectionType[] = [
    {
      id: e2eIds.fullBandSectionTypeId,
      name: e2eData.sectionTypes.fullBand,
      organizationId: e2eIds.organizationId,
    },
    {
      id: e2eIds.prayerSectionTypeId,
      name: e2eData.sectionTypes.prayer,
      organizationId: e2eIds.organizationId,
    },
    {
      id: e2eIds.songDetailDesktopSectionTypeId,
      name: e2eData.sectionTypes.songDetailDesktop,
      organizationId: e2eIds.organizationId,
    },
    {
      id: e2eIds.songDetailMobileSectionTypeId,
      name: e2eData.sectionTypes.songDetailMobile,
      organizationId: e2eIds.organizationId,
    },
  ];

  const set: NewSet = {
    id: e2eIds.setId,
    eventTypeId: e2eIds.eventTypeId,
    date: e2eData.set.date,
    notes: e2eData.set.notes,
    organizationId: e2eIds.organizationId,
    isArchived: false,
  };

  const sections: NewSetSection[] = [
    {
      id: e2eIds.fullBandSectionId,
      setId: e2eIds.setId,
      position: 0,
      sectionTypeId: e2eIds.fullBandSectionTypeId,
      organizationId: e2eIds.organizationId,
    },
    {
      id: e2eIds.prayerSectionId,
      setId: e2eIds.setId,
      position: 1,
      sectionTypeId: e2eIds.prayerSectionTypeId,
      organizationId: e2eIds.organizationId,
    },
    {
      id: e2eIds.songDetailDesktopSectionId,
      setId: e2eIds.setId,
      position: 2,
      sectionTypeId: e2eIds.songDetailDesktopSectionTypeId,
      organizationId: e2eIds.organizationId,
    },
    {
      id: e2eIds.songDetailMobileSectionId,
      setId: e2eIds.setId,
      position: 3,
      sectionTypeId: e2eIds.songDetailMobileSectionTypeId,
      organizationId: e2eIds.organizationId,
    },
  ];

  const seededSongs: NewSong[] = [
    {
      id: e2eIds.firstSongId,
      name: e2eData.songs.first.name,
      preferredKey: "g",
      notes: e2eData.songs.first.notes,
      createdBy: env.E2E_CLERK_USER_ID,
      organizationId: e2eIds.organizationId,
      isArchived: false,
      favoritedAt: null,
    },
    {
      id: e2eIds.secondSongId,
      name: e2eData.songs.second.name,
      preferredKey: "c",
      notes: e2eData.songs.second.notes,
      createdBy: env.E2E_CLERK_USER_ID,
      organizationId: e2eIds.organizationId,
      isArchived: false,
      favoritedAt: null,
    },
    {
      id: e2eIds.addSongToSetDesktopSongId,
      name: e2eData.set.addSongToSet.desktopSong.name,
      preferredKey: e2eData.set.addSongToSet.desktopSong.preferredKey,
      notes: e2eData.set.addSongToSet.desktopSong.notes,
      createdBy: env.E2E_CLERK_USER_ID,
      organizationId: e2eIds.organizationId,
      isArchived: false,
      favoritedAt: null,
    },
    {
      id: e2eIds.addSongToSetMobileSongId,
      name: e2eData.set.addSongToSet.mobileSong.name,
      preferredKey: e2eData.set.addSongToSet.mobileSong.preferredKey,
      notes: e2eData.set.addSongToSet.mobileSong.notes,
      createdBy: env.E2E_CLERK_USER_ID,
      organizationId: e2eIds.organizationId,
      isArchived: false,
      favoritedAt: null,
    },
    {
      id: e2eIds.addSongToSetFromSongDetailDesktopSongId,
      name: e2eData.songs.addSongToSetFromSongDetailDesktop.name,
      preferredKey:
        e2eData.songs.addSongToSetFromSongDetailDesktop.preferredKey,
      notes: e2eData.songs.addSongToSetFromSongDetailDesktop.notes,
      createdBy: env.E2E_CLERK_USER_ID,
      organizationId: e2eIds.organizationId,
      isArchived: false,
      favoritedAt: null,
    },
    {
      id: e2eIds.addSongToSetFromSongDetailMobileSongId,
      name: e2eData.songs.addSongToSetFromSongDetailMobile.name,
      preferredKey: e2eData.songs.addSongToSetFromSongDetailMobile.preferredKey,
      notes: e2eData.songs.addSongToSetFromSongDetailMobile.notes,
      createdBy: env.E2E_CLERK_USER_ID,
      organizationId: e2eIds.organizationId,
      isArchived: false,
      favoritedAt: null,
    },
    {
      id: e2eIds.songDetailDesktopAnchorSongId,
      name: e2eData.songs.songDetailDesktopAnchor.name,
      preferredKey: "g",
      notes: e2eData.songs.songDetailDesktopAnchor.notes,
      createdBy: env.E2E_CLERK_USER_ID,
      organizationId: e2eIds.organizationId,
      isArchived: false,
      favoritedAt: null,
    },
    {
      id: e2eIds.songDetailMobileAnchorSongId,
      name: e2eData.songs.songDetailMobileAnchor.name,
      preferredKey: "c",
      notes: e2eData.songs.songDetailMobileAnchor.notes,
      createdBy: env.E2E_CLERK_USER_ID,
      organizationId: e2eIds.organizationId,
      isArchived: false,
      favoritedAt: null,
    },
  ];

  const setSongs: NewSetSectionSong[] = [
    {
      id: e2eIds.firstSetSectionSongId,
      setSectionId: e2eIds.fullBandSectionId,
      songId: e2eIds.firstSongId,
      position: 0,
      key: "g",
      notes: e2eData.songs.first.setNotes,
      organizationId: e2eIds.organizationId,
    },
    {
      id: e2eIds.secondSetSectionSongId,
      setSectionId: e2eIds.prayerSectionId,
      songId: e2eIds.secondSongId,
      position: 0,
      key: "c",
      notes: e2eData.songs.second.setNotes,
      organizationId: e2eIds.organizationId,
    },
    {
      id: e2eIds.songDetailDesktopSetSectionSongId,
      setSectionId: e2eIds.songDetailDesktopSectionId,
      songId: e2eIds.songDetailDesktopAnchorSongId,
      position: 0,
      key: "g",
      notes: e2eData.songs.songDetailDesktopAnchor.setNotes,
      organizationId: e2eIds.organizationId,
    },
    {
      id: e2eIds.songDetailMobileSetSectionSongId,
      setSectionId: e2eIds.songDetailMobileSectionId,
      songId: e2eIds.songDetailMobileAnchorSongId,
      position: 0,
      key: "c",
      notes: e2eData.songs.songDetailMobileAnchor.setNotes,
      organizationId: e2eIds.organizationId,
    },
  ];

  const tag: NewTag = {
    id: e2eIds.tagId,
    tag: e2eData.tag.tag,
    organizationId: e2eIds.organizationId,
  };

  const seededSongTags: NewSongTag[] = [
    {
      songId: e2eIds.firstSongId,
      tagId: e2eIds.tagId,
    },
    {
      songId: e2eIds.addSongToSetDesktopSongId,
      tagId: e2eIds.tagId,
    },
    {
      songId: e2eIds.addSongToSetMobileSongId,
      tagId: e2eIds.tagId,
    },
  ];

  const resource: NewResource = {
    id: e2eIds.resourceId,
    songId: e2eIds.firstSongId,
    organizationId: e2eIds.organizationId,
    title: e2eData.resource.title,
    url: e2eData.resource.url,
    status: "ready",
    metaTitle: e2eData.resource.title,
    metaDescription: "A stable E2E chart resource.",
    faviconUrl: null,
    imageUrl: null,
    lastFetchedAt: new Date("2099-01-01T00:00:00.000Z"),
  };

  await db.insert(users).values(user);
  await db.insert(userPreferences).values(userPreference);
  await db
    .insert(organizations)
    .values([placeholderHomeOrganization, organization]);
  await db.insert(organizationMemberships).values(membership);
  await db.insert(eventTypes).values(eventType);
  await db.insert(setSectionTypes).values(sectionTypes);
  await db.insert(sets).values(set);
  await db.insert(setSections).values(sections);
  await db.insert(songs).values(seededSongs);
  await db.insert(setSectionSongs).values(setSongs);
  await db.insert(tags).values(tag);
  await db.insert(songTags).values(seededSongTags);
  await db.insert(resources).values(resource);

  logger.info("E2E database seed completed.");
};

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  seedE2eDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error("E2E database seed failed.", error);
      process.exit(1);
    });
}
