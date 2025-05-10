// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { songKeys } from "@lib/constants";

const updatedAt = timestamp("updatedAt")
  .defaultNow()
  .notNull()
  .$onUpdate(() => new Date());

export const createTable = pgTableCreator((name) => `sanbi_${name}`);

export const memberPermissionTypeEnum = pgEnum("member_permission_types", [
  "admin",
  "owner",
  "member",
]);

export const songKeyEnum = pgEnum("song_keys", songKeys);

export const users = createTable(
  "users",
  {
    id: varchar("id", { length: 48 }).primaryKey(),
    firstName: varchar("firstName", { length: 256 }).notNull(),
    lastName: varchar("lastName", { length: 256 }),
    email: varchar("email", { length: 256 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt,
  },
  (usersTable) => {
    return {
      emailIndex: uniqueIndex("users_email_idx").on(usersTable.email),
    };
  },
);

export const organizations = createTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name").notNull().unique(),
    slug: varchar("slug").unique().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt,
  },
  (organizationsTable) => {
    return {
      // FIXME: update the index to be case insensitive
      nameIndex: uniqueIndex("organizations_name_idx").on(
        organizationsTable.name,
      ),
      slug: uniqueIndex("organizations_slug_idx").on(organizationsTable.slug),
    };
  },
);

export const organizationMemberships = createTable(
  "organization_memberships",
  {
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    userId: varchar("user_id", { length: 48 })
      .references(() => users.id)
      .notNull(),
    permissionType: memberPermissionTypeEnum(
      "membership_permission_type",
    ).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt,
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.organizationId, table.userId] }),
    };
  },
);

export const tags = createTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tag: varchar("tag", { length: 256 }).notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt,
  },
  (tagsTable) => ({
    tagOrganizationUniqueIndex: uniqueIndex(
      "tags_organization_tag_unique_index",
    ).on(tagsTable.organizationId, tagsTable.tag),
  }),
);

export const songTags = createTable(
  "song_tags",
  {
    songId: uuid("song_id")
      .references(() => songs.id)
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt,
  },
  (songTagsTable) => {
    return {
      pk: primaryKey({ columns: [songTagsTable.songId, songTagsTable.tagId] }),
    };
  },
);

export const songs = createTable(
  "songs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 256 }).notNull(),
    preferredKey: songKeyEnum("preferred_song_key"),
    notes: text("notes"),
    tempo: varchar("tempo", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdBy: varchar("created_by", { length: 48 })
      .references(() => users.id)
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    isArchived: boolean("is_archived").notNull(),
    favoritedAt: timestamp("favorited_at"),
    updatedAt,
  },
  (songsTable) => {
    return {
      organizationIndex: index("songs_organisation_id_idx").on(
        songsTable.organizationId,
      ),
    };
  },
);

export const eventTypes = createTable("event_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("event").unique().notNull(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt,
});

export const sets = createTable(
  "sets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventTypeId: uuid("event_type_id")
      .references(() => eventTypes.id)
      .notNull(),
    date: date("date").notNull(),
    notes: text("notes"),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    isArchived: boolean("is_archived").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt,
  },
  (setsTable) => ({
    eventTypeDateIndex: index("sets_event_type_date_index").on(
      setsTable.eventTypeId,
      setsTable.date,
    ),
  }),
);

export const setSectionTypes = createTable("set_section_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").unique().notNull(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt,
});

export const setSections = createTable(
  "set_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    setId: uuid("set_id")
      .references(() => sets.id, { onDelete: "cascade" })
      .notNull(),
    position: integer("position").notNull(),
    sectionTypeId: uuid("section_type_id")
      .references(() => setSectionTypes.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt,
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
  },
  (setSectionsTable) => {
    return {
      setIdIndex: index("set_sections_set_id_idx").on(setSectionsTable.setId),
    };
  },
);

export const setSectionSongs = createTable("set_section_songs", {
  id: uuid("id").primaryKey().defaultRandom(),
  setSectionId: uuid("set_section_id")
    .references(() => setSections.id, { onDelete: "cascade" })
    .notNull(),
  songId: uuid("song_id")
    .references(() => songs.id)
    .notNull(),
  position: integer("position").notNull(),
  key: songKeyEnum("song_key"),
  notes: text("notes"),
  organizationId: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt,
});

/** drizzle relationships */
export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMemberships),
  songs: many(songs),
  sets: many(sets),
  setSectionSongs: many(setSectionSongs),
  eventTypes: many(eventTypes),
  tags: many(tags),
}));

export const organizationMembersRelations = relations(
  organizationMemberships,
  ({ one }) => ({
    member: one(users, {
      fields: [organizationMemberships.userId],
      references: [users.id],
    }),
    organization: one(organizations, {
      fields: [organizationMemberships.organizationId],
      references: [organizations.id],
    }),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(organizationMemberships),
  songs: many(songs),
}));

export const songsRelations = relations(songs, ({ one, many }) => ({
  creator: one(users, {
    fields: [songs.createdBy],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [songs.organizationId],
    references: [organizations.id],
  }),
  songTags: many(songTags),
  sets: many(setSectionSongs),
}));

export const songTagsRelations = relations(songTags, ({ one }) => ({
  song: one(songs, {
    fields: [songTags.songId],
    references: [songs.id],
  }),
  tag: one(tags, {
    fields: [songTags.tagId],
    references: [tags.id],
  }),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  songTags: many(songTags),
  organization: one(organizations, {
    fields: [tags.organizationId],
    references: [organizations.id],
  }),
}));

export const setSectionSongsRelations = relations(
  setSectionSongs,
  ({ one }) => ({
    song: one(songs, {
      fields: [setSectionSongs.songId],
      references: [songs.id],
    }),
    setSection: one(setSections, {
      fields: [setSectionSongs.setSectionId],
      references: [setSections.id],
    }),
    organization: one(organizations, {
      fields: [setSectionSongs.organizationId],
      references: [organizations.id],
    }),
  }),
);

export const setSectionsRelations = relations(setSections, ({ one, many }) => ({
  songs: many(setSectionSongs),
  set: one(sets, {
    fields: [setSections.setId],
    references: [sets.id],
  }),
  type: one(setSectionTypes, {
    fields: [setSections.sectionTypeId],
    references: [setSectionTypes.id],
  }),
  organization: one(organizations, {
    fields: [setSections.organizationId],
    references: [organizations.id],
  }),
}));

export const sectionTypesRelations = relations(setSectionTypes, ({ many }) => ({
  setSections: many(setSections),
}));

export const setsRelations = relations(sets, ({ one, many }) => ({
  eventType: one(eventTypes, {
    fields: [sets.eventTypeId],
    references: [eventTypes.id],
  }),
  sections: many(setSections),
  organization: one(organizations, {
    fields: [sets.organizationId],
    references: [organizations.id],
  }),
}));

export const eventTypesRelations = relations(eventTypes, ({ one, many }) => ({
  sets: many(sets),
  organizations: one(organizations, {
    fields: [eventTypes.organizationId],
    references: [organizations.id],
  }),
}));
