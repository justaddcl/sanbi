"use client";

import {
  HouseLine,
  MagnifyingGlass,
  MusicNoteSimple,
  Playlist,
} from "@phosphor-icons/react/dist/ssr";
import { NavLink } from "@components/NavLink";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/trpc/react";
import { Skeleton } from "@components/ui/skeleton";
import { skipToken } from "@tanstack/react-query";

export const GlobalNav = () => {
  const { userId, isSignedIn } = useAuth();
  const {
    isPending,
    isError,
    data: userData,
  } = api.user.getUser.useQuery(userId ? { userId } : skipToken);
  const user = userData;

  if (isPending) {
    return (
      <div className="grid gap-2">
        <div className="flex items-center gap-4 py-2 align-middle lg:gap-3">
          <Skeleton className="size-5 rounded lg:size-4" />
          <Skeleton className="h-5 w-full lg:h-4" />
        </div>
        <div className="flex items-center gap-4 py-2 align-middle lg:gap-3">
          <Skeleton className="size-5 rounded lg:size-4" />
          <Skeleton className="h-5 w-full lg:h-4" />
        </div>
        <div className="flex items-center gap-4 py-2 align-middle lg:gap-3">
          <Skeleton className="size-5 rounded lg:size-4" />
          <Skeleton className="h-5 w-full lg:h-4" />
        </div>
        <div className="flex items-center gap-4 py-2 align-middle lg:gap-3">
          <Skeleton className="size-5 rounded lg:size-4" />
          <Skeleton className="h-5 w-full lg:h-4" />
        </div>
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

  const { organizationId } = organizationMembership;
  return (
    <nav className="grid gap-2 lg:fixed lg:top-24 lg:w-[234px]">
      <NavLink
        href={`/${organizationId}`}
        icon={<HouseLine weight={true ? "bold" : "regular"} />}
        // TODO: dynamically set which menu item is active
        active
      >
        Home
      </NavLink>
      <NavLink href="#" icon={<MagnifyingGlass />}>
        Search
      </NavLink>
      <NavLink href="#" icon={<Playlist />}>
        Sets
      </NavLink>
      <NavLink href="#" icon={<MusicNoteSimple />}>
        Songs
      </NavLink>
    </nav>
  );
};
