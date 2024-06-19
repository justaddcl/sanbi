import {
  type setSectionTypes,
  type eventTypes,
  type organizationMembers,
  type organizations,
  type users,
  type tags,
  type songs,
} from "@server/db/schema";

export type NewOrganization = typeof organizations.$inferInsert;

export type NewOrganizationMembership = typeof organizationMembers.$inferInsert;

export type NewUser = typeof users.$inferInsert;

export type NewEventType = typeof eventTypes.$inferInsert;

export type NewSetSectionType = typeof setSectionTypes.$inferInsert;

export type NewTag = typeof tags.$inferInsert;
export type Tag = typeof tags.$inferSelect;

export type NewSong = typeof songs.$inferInsert;
