"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import { validate as uuidValidate } from "uuid";

import { orpc } from "@lib/orpc/client";

export const useSongResources = (songId: string, organizationId: string) =>
  useQuery(
    orpc.resource.getBySongId.queryOptions({
      input:
        uuidValidate(songId) && uuidValidate(organizationId)
          ? {
              songId,
              organizationId,
            }
          : skipToken,
    }),
  );
