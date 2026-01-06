import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { Text } from "@components/Text";
import { SongDetailsPage } from "@modules/songs/components/SongDetailsPage/SongDetailsPage";
import { getServerQueryClient } from "@lib/orpc/get-server-query-client";
import { orpcServerTQ } from "@lib/orpc/tanstack-server";
import { HydrateClient, trpc } from "@lib/trpc/server";

export default async function SetListPage({
  params,
}: {
  params: { organization: string; songId: string };
}) {
  const queryClient = getServerQueryClient();

  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  const userData = await trpc.user.getUser({ userId });
  const userMembership = userData?.memberships[0];

  if (!userData) {
    return <Text>Loading user data...</Text>;
  }

  if (!userMembership) {
    redirect("/");
  }

  await trpc.song.get.prefetch({
    songId: params.songId,
    organizationId: userMembership.organizationId,
  });

  await trpc.song.getPlayHistory.prefetch({
    songId: params.songId,
    organizationId: userMembership.organizationId,
  });

  await queryClient.prefetchQuery(
    orpcServerTQ.resource.getBySongId.queryOptions({
      input: {
        songId: params.songId,
        organizationId: userMembership.organizationId,
      },
    }),
  );

  return (
    <HydrateClient>
      <SongDetailsPage
        songId={params.songId}
        organizationId={params.organization}
        userMembership={userMembership}
      />
    </HydrateClient>
  );
}
