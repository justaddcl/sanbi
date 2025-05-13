import React from "react";
import { toast } from "sonner";

import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { HStack } from "@components/HStack";
import { VStack } from "@components/VStack";
import {
  formatFriendlyDate,
  SetSelectionSection,
  SetSelectionSetItem,
} from "@modules/songs/forms/AddSongToSet/components";
import { useUserQuery } from "@modules/users/api/queries";
import { pluralize } from "@lib/string";
import { api } from "@/trpc/react";

export const SetSelectionAllUpcomingSets: React.FC = () => {
  const {
    data: userData,
    error: userQueryError,
    isLoading: userQueryLoading,
    isAuthLoaded,
  } = useUserQuery();
  const userMembership = userData?.memberships[0];

  if (!userMembership) {
    // TODO: how do we best handle this case?
    return null;
  }

  const {
    data: setsData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    error: getInfiniteSetsQueryError,
  } = api.set.getInfinite.useInfiniteQuery(
    {
      organizationId: userMembership.organizationId,
    },
    {
      getNextPageParam: (last) => last.nextCursor,
    },
  );

  // FIXME: add skeleton to mimic mobile styles
  if (isLoading) {
    return (
      <SetSelectionSection title="All upcoming sets">
        <VStack className="gap-4 px-3">
          <HStack className="justify-between">
            <HStack className="gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-40" />
            </HStack>
            <Skeleton className="h-5 w-20" />
          </HStack>
          <HStack className="justify-between">
            <HStack className="gap-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-32" />
            </HStack>
            <Skeleton className="h-5 w-20" />
          </HStack>
        </VStack>
      </SetSelectionSection>
    );
  }

  if (getInfiniteSetsQueryError) {
    toast.error(`Could not get sets: ${getInfiniteSetsQueryError.message}`);
    return <div>Error loading sets</div>;
  }

  if (!setsData) {
    return <div>No sets found...</div>;
  }
  return (
    <SetSelectionSection title="All upcoming sets">
      {setsData.pages.map((setsPage, pageIndex) => (
        <React.Fragment key={pageIndex}>
          {setsPage.sets.map((set) => (
            <SetSelectionSetItem
              key={set.id}
              title={formatFriendlyDate(set.date)}
              subtitle={set.eventType!} // eventType is marked as notNull:true, so not sure why the type is nullable, but this appeases TS for now
              label={`${set.songCount} ${pluralize(set.songCount, { singular: "song", plural: "songs" })}`}
            />
          ))}
        </React.Fragment>
      ))}
      {hasNextPage && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mt-4"
        >
          {isFetchingNextPage ? "Loading more sets..." : "Load more sets"}
        </Button>
      )}
    </SetSelectionSection>
  );
};
