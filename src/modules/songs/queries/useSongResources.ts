"use client";

import { validate as uuidValidate } from "uuid";

import { trpc } from "@lib/trpc";

export const useSongResources = (songId: string, organizationId: string) =>
  trpc.resource.getBySongId.useQuery(
    {
      songId,
      organizationId,
    },
    {
      enabled: uuidValidate(songId) && uuidValidate(organizationId),
    },
  );
