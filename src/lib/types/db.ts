import {
  type organizations,
  type setSectionTypes,
  type eventTypes,
  type organizationMemberships,
  type users,
  type tags,
  type songs,
  type songTags,
  type sets,
  type setSections,
  type setSectionSongs,
} from "@server/db/schema";

export type NewOrganization = typeof organizations.$inferInsert;
export type Organization = typeof organizations.$inferSelect;

export type NewOrganizationMembership =
  typeof organizationMemberships.$inferInsert;

export type NewUser = typeof users.$inferInsert;

export type NewEventType = typeof eventTypes.$inferInsert;
export type EventType = typeof eventTypes.$inferSelect;

export type NewSetSectionType = typeof setSectionTypes.$inferInsert;

export type NewTag = typeof tags.$inferInsert;
export type Tag = typeof tags.$inferSelect;

export type NewSong = typeof songs.$inferInsert;
export type Song = typeof songs.$inferSelect;

export type NewSongTag = typeof songTags.$inferInsert;

export type NewSet = typeof sets.$inferInsert;

export type NewSetSection = typeof setSections.$inferInsert;
export type SetSection = typeof setSections.$inferSelect;

export type NewSetSectionSong = typeof setSectionSongs.$inferInsert;
