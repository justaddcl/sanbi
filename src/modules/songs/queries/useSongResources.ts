"use client";

import { skipToken, useQuery } from "@tanstack/react-query";

import { useUserQuery } from "@modules/users/api/queries";
import { orpc } from "@lib/orpc/client";

export const useSongResources = (songId: string) => {
  const { userMembership } = useUserQuery();

  return useQuery(
    orpc.resource.getBySongId.queryOptions({
      input: userMembership
        ? {
            songId,
            organizationId: userMembership.organizationId,
          }
        : skipToken,
      enabled: !!userMembership,
    }),
  );
};
