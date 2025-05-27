import React from "react";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";

import { Button } from "@components/ui/button";
import { type DatePickerValue } from "@components/ui/datePicker";
import { Skeleton } from "@components/ui/skeleton";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import {
  formatFriendlyDate,
  SetSelectionSection,
  SetSelectionSetItem,
} from "@modules/songs/forms/AddSongToSet/components";
import { useUserQuery } from "@modules/users/api/queries";
import { pluralize } from "@lib/string";
import { api } from "@/trpc/react";

import { type SetSelectionEventTypeFilters } from "./SetSelectionStep";

type SetSelectionAllUpcomingSetsProps = {
  eventTypeFilters: SetSelectionEventTypeFilters;
  dateFilter: DatePickerValue<"range"> | undefined;
  onCreateSetClick: () => void;
};

export const SetSelectionAllUpcomingSets: React.FC<
  SetSelectionAllUpcomingSetsProps
> = ({ eventTypeFilters, dateFilter, onCreateSetClick }) => {
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
      dateRange: dateFilter?.from
        ? {
            from: dateFilter.from.toLocaleDateString("en-CA"),
            to: dateFilter.to
              ? dateFilter.to.toLocaleDateString("en-CA")
              : null,
          }
        : null,
      eventTypeFilters: eventTypeFilters.map((filter) => filter.id),
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
    <SetSelectionSection
      title="All upcoming sets"
      label={
        <Button
          variant="outline"
          size="sm"
          className="mb-1 md:hidden"
          onClick={() => {
            onCreateSetClick();
          }}
        >
          <HStack className="items-center gap-2">
            <Plus />
            <Text className="text-sm">Create set</Text>
          </HStack>
        </Button>
      }
    >
      {setsData.pages.map((setsPage, pageIndex) => (
        <React.Fragment key={pageIndex}>
          {(!setsPage.sets || setsPage.sets.length === 0) && (
            <SetSelectionSetItem
              title="No sets found..."
              subtitle="But you can create one!"
            />
          )}
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
