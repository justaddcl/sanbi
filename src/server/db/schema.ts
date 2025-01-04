// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { songKeys } from "@lib/constants";
import { relations, sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  pgEnum,
  pgTableCreator,
  primaryKey,
  uuid,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

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
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
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
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
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
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.organizationId, table.userId] }),
    };
  },
);

export const tags = createTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  tag: varchar("tag", { length: 256 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

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
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
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
    name: varchar("name", { length: 256 }).notNull().unique(),
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
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
});

export const sets = createTable("sets", {
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
});

export const setSectionTypes = createTable("set_section_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  section: varchar("section").unique().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const setSections = createTable(
  "set_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    setId: uuid("set_id")
      .references(() => sets.id)
      .notNull(),
    position: integer("position").notNull(),
    sectionTypeId: uuid("section_type_id")
      .references(() => setSectionTypes.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (setSectionsTable) => {
    return {
      setIdIndex: index("set_sections_set_id_idx").on(setSectionsTable.setId),
    };
  },
);

export const setSectionSongs = createTable(
  "set_section_songs",
  {
    setSectionId: uuid("set_section_id")
      .references(() => setSections.id)
      .notNull(),
    songId: uuid("song_id")
      .references(() => songs.id)
      .notNull(),
    position: integer("position").notNull(),
    key: songKeyEnum("song_key"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (setSectionSongsTable) => {
    return {
      pk: primaryKey({
        columns: [
          setSectionSongsTable.setSectionId,
          setSectionSongsTable.songId,
        ],
      }),
    };
  },
);

/** drizzle relationships */
export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMemberships),
  songs: many(songs),
  sets: many(sets),
  eventTypes: many(eventTypes),
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
  tags: many(songTags),
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

export const tagsRelations = relations(tags, ({ many }) => ({
  songTags: many(songTags),
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
  organizations: one(organizations),
}));
