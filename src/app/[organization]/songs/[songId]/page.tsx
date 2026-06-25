import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { SongDetailsPage } from "@modules/songs/components/SongDetailsPage/SongDetailsPage";
import { HydrateClient, trpc } from "@lib/trpc/server";

export default async function SongPage({
  params,
}: {
  params: Promise<{ organization: string; songId: string }>;
}) {
  const { organization, songId } = await params;

  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const userData = await trpc.user.getUser({ userId });
  const userMembership = userData?.memberships.find(
    (membership) => membership.organization.id === organization,
  );

  if (!userMembership) {
    redirect("/");
  }

  await trpc.song.get.prefetch({
    songId,
    organizationId: userMembership.organizationId,
  });

  await trpc.resource.getBySongId.prefetch({
    songId,
    organizationId: userMembership.organizationId,
  });

  return (
    <HydrateClient>
      <SongDetailsPage
        songId={songId}
        organizationId={userMembership.organizationId}
        userMembership={userMembership}
      />
    </HydrateClient>
  );
}
