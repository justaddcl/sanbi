// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTableCreator,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `sanbi_${name}`);

// export const posts = createTable(
//   "post",
//   {
//     id: serial("id").primaryKey(),
//     name: varchar("name", { length: 256 }),
//     createdAt: timestamp("created_at", { withTimezone: true })
//       .default(sql`CURRENT_TIMESTAMP`)
//       .notNull(),
//     updatedAt: timestamp("updatedAt", { withTimezone: true }),
//   },
//   (example) => ({
//     nameIndex: index("name_idx").on(example.name),
//   })
// );

export const users = createTable("user", {
  id: serial("id").primaryKey(),
  firstName: varchar("firstName", { length: 256 }).notNull(),
  lastName: varchar("lastName", { length: 256 }),
  email: varchar("email", { length: 256 }).notNull().unique(),
});

export const songKeyEnum = pgEnum("song_key", [
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

export const songs = createTable("song", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  key: songKeyEnum("key"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  createdBy: integer("user_id")
    .references(() => users.id)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
});
