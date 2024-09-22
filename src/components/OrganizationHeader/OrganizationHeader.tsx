"use client";

import { api } from "@/trpc/react";
import { useAuth } from "@clerk/nextjs";
import { Skeleton } from "@components/ui/skeleton";
import { skipToken } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import { OrganizationHeaderLink } from "@components/OrganizationHeader/OrganizationHeaderLink";

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

  const ForwardedOrganizationHeaderLink = React.forwardRef(
    OrganizationHeaderLink,
  );
  return (
    <Link
      href={`/${organizationMembership.organizationId}`}
      passHref
      legacyBehavior
    >
      <ForwardedOrganizationHeaderLink organizationName={organizationName} />
    </Link>
  );
};
