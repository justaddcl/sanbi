// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  pgEnum,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `sanbi_${name}`);

export const memberPermissionTypeEnum = pgEnum("member_permission_types", [
  "admin",
  "owner",
  "member",
]);

export const songKeyEnum = pgEnum("song_keys", [
  "c",
  "c_sharp",
  "d_flat",
  "d",
  "d_sharp",
  "e_flat",
  "e",
  "f",
  "f_sharp",
  "g_flat",
  "g",
  "g_sharp",
  "a_flat",
  "a",
  "a_sharp",
  "b_flat",
  "b",
]);

export const users = createTable(
  "users",
  {
    id: serial("id").primaryKey(),
    firstName: varchar("firstName", { length: 256 }).notNull(),
    lastName: varchar("lastName", { length: 256 }),
    email: varchar("email", { length: 256 }).notNull().unique(),
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
    id: serial("id").primaryKey(),
    name: varchar("name").notNull().unique(),
    slug: varchar("slug").unique(),
  },
  (organizationsTable) => {
    return {
      nameIndex: uniqueIndex("organizations_name_idx").on(
        organizationsTable.name,
      ),
    };
  },
);

export const organizationMembers = createTable(
  "organization_memberships",
  {
    organizationId: integer("organization_id").references(
      () => organizations.id,
    ),
    userId: integer("user_id").references(() => users.id),

    permissionType: memberPermissionTypeEnum(
      "membership_permission_type",
    ).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.organizationId, table.userId] }),
    };
  },
);

export const tags = createTable("tags", {
  id: serial("id").primaryKey(),
  tag: varchar("tag", { length: 256 }).notNull().unique(),
});

export const songTags = createTable(
  "song_tags",
  {
    songId: integer("song_id").references(() => songs.id),
    tagId: integer("tag_id").references(() => tags.id),
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
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull().unique(),
    key: songKeyEnum("song_key"),
    notes: text("notes"),
    tempo: varchar("tempo", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdBy: integer("user_id")
      .references(() => users.id)
      .notNull(),
    organizationId: integer("organization_id").references(
      () => organizations.id,
    ),
    updatedAt: timestamp("updatedAt", { withTimezone: true }),
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
  id: serial("id").primaryKey(),
  event: varchar("event").unique().notNull(),
});

export const sets = createTable("sets", {
  id: serial("id").primaryKey(),
  eventTypeId: integer("event_type_id")
    .references(() => eventTypes.id)
    .notNull(),
  date: date("date").notNull(),
  notes: text("notes"),
});

export const setSectionTypes = createTable("set_section_types", {
  id: serial("id").primaryKey(),
  section: varchar("section").unique().notNull(),
});

export const setSections = createTable(
  "set_sections",
  {
    id: serial("id").primaryKey(),
    setId: integer("set_id")
      .references(() => sets.id)
      .notNull(),
    position: integer("position").notNull(),
    sectionTypeId: integer("section_type_id")
      .references(() => setSectionTypes.id)
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
    setSectionId: integer("set_section_id").references(() => setSections.id),
    songId: integer("song_id").references(() => songs.id),
    position: integer("position").notNull(),
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
  members: many(organizationMembers),
  songs: many(songs),
}));

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    member: one(users, {
      fields: [organizationMembers.userId],
      references: [users.id],
    }),
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(organizationMembers),
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
}));

export const eventTypesRelations = relations(eventTypes, ({ many }) => ({
  sets: many(sets),
}));
