"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import { validate as uuidValidate } from 'uuid';

import { useUserQuery } from "@modules/users/api/queries";
import { orpc } from "@lib/orpc/client";

export const useSongResources = (songId: string) => {
  const { userMembership } = useUserQuery();

  return useQuery(
    orpc.resource.getBySongId.queryOptions({
      input: userMembership && uuidValidate(songId)
        ? {
            songId,
            organizationId: userMembership.organizationId,
          }
        : skipToken,
    }),
  );
};
