export const songKeys = [
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
] as const;

export type SongKey = (typeof songKeys)[number];

export const resourceStatuses = ["queued", "ready", "failed"] as const;

export type ResourceStatus = (typeof resourceStatuses)[number];
