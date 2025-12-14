import React from "react";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { differenceInCalendarWeeks } from "date-fns";
import { toast } from "sonner";

import { Button } from "@components/ui/button";
import { type DatePickerValue } from "@components/ui/datePicker";
import { Skeleton } from "@components/ui/skeleton";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import {
  SetSelectionSection,
  SetSelectionSetItem,
} from "@modules/songs/forms/AddSongToSet/components";
import { useUserQuery } from "@modules/users/api/queries";
import {
  formatDate,
  formatFriendlyDate,
  FRIENDLY_FORMAT_CALENDAR_WEEK_DIFFERENCE_THRESHOLD,
} from "@lib/date";
import { pluralize } from "@lib/string";
import { api } from "@/trpc/react";

import {
  type SetSelectionEventTypeFilters,
  type SetSelectionStepProps,
} from "./SetSelectionStep";

type SetSelectionAllUpcomingSetsProps = {
  eventTypeFilters: SetSelectionEventTypeFilters;
  dateFilter: DatePickerValue<"range"> | undefined;
  onCreateSetClick: () => void;
  onSetSelect: SetSelectionStepProps["onSetSelect"];
};

export const SetSelectionAllUpcomingSets: React.FC<
  SetSelectionAllUpcomingSetsProps
> = ({ eventTypeFilters, dateFilter, onCreateSetClick, onSetSelect }) => {
  const {
    data: userData,
    error: userQueryError,
    isLoading: userQueryLoading,
    isAuthLoaded,
  } = useUserQuery();
  const userMembership = userData?.memberships[0];

  if (!userMembership) {
    return (
      <SetSelectionSection title="All upcoming sets">
        <div className="p-4 text-center text-muted-foreground">
          Unable to load sets. Looks like we can&apos;t verify which team
          you&apos;re a part of
        </div>
      </SetSelectionSection>
    );
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
            from: dateFilter.from,
            to: dateFilter.to ? dateFilter.to : null,
          }
        : null,
      eventTypeFilters: eventTypeFilters.map((filter) => filter.id),
    },
    {
      getNextPageParam: (last) => last.nextCursor,
    },
  );

  if (isLoading) {
    return (
      <SetSelectionSection title="All upcoming sets">
        <VStack className="gap-4 px-3 py-4 lg:gap-6">
          <HStack className="justify-between">
            <div className="flex flex-col gap-1 lg:flex-row lg:gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-5 w-16" />
          </HStack>
          <HStack className="justify-between">
            <div className="flex flex-col gap-1 lg:flex-row lg:gap-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-5 w-16" />
          </HStack>
          <HStack className="justify-between">
            <div className="flex flex-col gap-1 lg:flex-row lg:gap-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-5 w-16" />
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
    return (
      <SetSelectionSection title="All upcoming sets">
        <div className="p-4 text-center text-muted-foreground">
          No sets found. Try adjusting your filters or create a new set.
        </div>
      </SetSelectionSection>
    );
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
              titleTooltip={
                differenceInCalendarWeeks(set.date, new Date(), {
                  weekStartsOn: 0,
                }) < FRIENDLY_FORMAT_CALENDAR_WEEK_DIFFERENCE_THRESHOLD
                  ? formatDate(set.date)
                  : undefined
              }
              subtitle={set.eventType!} // eventType is marked as notNull:true, so not sure why the type is nullable, but this appeases TS for now
              label={`${set.songCount} ${pluralize(set.songCount, { singular: "song", plural: "songs" })}`}
              onClick={() => {
                onSetSelect({
                  id: set.id,
                  songCount: set.songCount,
                });
              }}
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
