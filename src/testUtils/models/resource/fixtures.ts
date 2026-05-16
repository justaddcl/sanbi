import { type Resource } from "@lib/types";

import { createResourceName, createResourceUrl } from "./generators";
import { createUuid } from "../../generators/createUuid";

export const createResourceFixture = (
  overrides: Partial<Resource> = {},
): Resource => ({
  id: createUuid(),
  songId: createUuid(),
  organizationId: createUuid(),
  title: createResourceName(),
  url: createResourceUrl(),
  status: "queued",
  metaTitle: null,
  metaDescription: null,
  faviconUrl: null,
  imageUrl: null,
  lastFetchedAt: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  ...overrides,
});
