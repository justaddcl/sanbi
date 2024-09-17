"use client";

import { type UserWithMemberships } from "@/lib/types";
import { api } from "@/trpc/react";
import { useAuth } from "@clerk/nextjs";
import { Text } from "@components/Text";
import { Skeleton } from "@components/ui/skeleton";
import { skipToken } from "@tanstack/react-query";
import Link from "next/link";

export const OrganizationHeader: React.FC = () => {
  const { userId, isSignedIn } = useAuth();

  const {
    isPending,
    isError,
    data: userData,
  } = api.user.getUser.useQuery(userId ? { userId } : skipToken);
  const user = userData;

  if (isPending) {
    return (
      <div className="mb-8 flex items-center gap-3 lg:mb-10">
        <Skeleton className="size-8 rounded" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!isSignedIn || !userId || isError || !user) {
    return null;
  }

  const organizationMembership = user.memberships[0];

  if (!organizationMembership) {
    return null;
  }

  const organizationName = organizationMembership?.organization.name;
  const organizationInitials = organizationName
    ?.split(" ")
    .map((word: string) => word[0])
    .join("");

  return (
    <Link href={`/${organizationMembership.organizationId}`}>
      <div className="mb-8 flex items-center gap-3 lg:mb-10">
        <div className="flex size-8 place-content-center rounded bg-slate-200 py-1">
          {/* TODO: determine how to style if more than two letter initials */}
          <Text
            style="header-medium-semibold"
            color="slate-700"
            className="inline-block"
            lineHeight="normal"
          >
            {organizationInitials}
          </Text>
        </div>
        <Text style="header-medium-semibold" color="slate-700">
          {organizationName}
        </Text>
      </div>
    </Link>
  );
};
