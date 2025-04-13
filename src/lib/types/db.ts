import { type RouterOutputs } from "@/trpc/react";
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
export type OrganizationMembership =
  typeof organizationMemberships.$inferSelect;
export type OrganizationMembershipWithOrganization = OrganizationMembership & {
  organization: Organization;
};

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserWithMembership = User & {
  membership: OrganizationMembershipWithOrganization;
};
export type UserWithMemberships = RouterOutputs["user"]["getUser"];

export type NewEventType = typeof eventTypes.$inferInsert;
export type EventType = typeof eventTypes.$inferSelect;

export type NewSetSectionType = typeof setSectionTypes.$inferInsert;
export type SetSectionTypeType = typeof setSectionTypes.$inferSelect;

export type NewTag = typeof tags.$inferInsert;
export type Tag = typeof tags.$inferSelect;

export type NewSong = typeof songs.$inferInsert;
export type Song = typeof songs.$inferSelect;

export type NewSongTag = typeof songTags.$inferInsert;
export type SongTag = typeof songTags.$inferSelect;

export type NewSet = typeof sets.$inferInsert;
export type SetType = typeof sets.$inferSelect; // have to have the "Type" suffix since Set is a reserved keyword
export type SetWithSectionsSongsAndEventType = SetType & {
  eventType: SetSectionTypeType;
  sections: SetSectionWithSongs[];
};

export type NewSetSection = typeof setSections.$inferInsert;
export type SetSection = typeof setSections.$inferSelect;

export type NewSetSectionSong = typeof setSectionSongs.$inferInsert;
export type SetSectionSong = typeof setSectionSongs.$inferSelect;

export type SetSectionSongWithSongData = SetSectionSong & {
  song: Song;
};

export type SetSectionWithSongs = SetSection & {
  type: SetSectionTypeType;
  songs: SetSectionSongWithSongData[];
};

export type SetSectionProps = {
  section: SetSectionWithSongs;
  sectionStartIndex: number;
};
