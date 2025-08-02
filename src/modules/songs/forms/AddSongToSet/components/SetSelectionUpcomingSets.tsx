import { useState } from "react";
import { differenceInCalendarWeeks } from "date-fns";
import { toast } from "sonner";

import { Skeleton } from "@components/ui/skeleton";
import { HStack } from "@components/HStack";
import { VStack } from "@components/VStack";
import {
  SetSelectionSection,
  SetSelectionSetItem,
  type SetSelectionStepProps,
  SetSelectionUpcomingSetsLabel,
} from "@modules/songs/forms/AddSongToSet/components";
import { useUserQuery } from "@modules/users/api/queries";
import {
  formatDate,
  formatFriendlyDate,
  FRIENDLY_FORMAT_CALENDAR_WEEK_DIFFERENCE_THRESHOLD,
} from "@lib/date";
import { pluralize } from "@lib/string";
import { api } from "@/trpc/react";

type SetSelectionAllUpcomingSetsProps = {
  onSetSelect: SetSelectionStepProps["onSetSelect"];
};

export const SetSelectionUpcomingSets: React.FC<
  SetSelectionAllUpcomingSetsProps
> = ({ onSetSelect }) => {
  const [shouldShowFilteredList, setShouldShowFilteredList] =
    useState<boolean>(true);

  const {
    data: userData,
    error: userQueryError,
    isLoading: userQueryLoading,
    isAuthLoaded,
    userMembership,
  } = useUserQuery();

  const {
    data: upcomingSetsData,
    isLoading: isUpcomingSetsQueryLoading,
    error: upcomingSetsQueryError,
  } = api.set.getUpcoming.useQuery(
    {
      organizationId: userMembership?.organizationId ?? "",
    },
    {
      enabled: !!userMembership?.organizationId,
    },
  );

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

  const upcomingSetsList = shouldShowFilteredList
    ? upcomingSetsData?.filter((upcomingSet) => !!upcomingSet.favoritedAt)
    : upcomingSetsData;

  // FIXME: add skeleton to mimic mobile styles
  if (isUpcomingSetsQueryLoading) {
    return (
      <SetSelectionSection title="Next sets" label="Show more">
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
        </VStack>
      </SetSelectionSection>
    );
  }

  if (!!upcomingSetsQueryError || !upcomingSetsData) {
    // TODO: how do we better handle this?
    toast.error(
      `Ran into an issue when trying to find the upcoming sets${!!upcomingSetsQueryError ? `: ${upcomingSetsQueryError.message}` : ""}`,
    );
    return null;
  }

  return (
    <SetSelectionSection
      title="Next sets"
      label={
        <SetSelectionUpcomingSetsLabel
          shouldShowFilteredList={shouldShowFilteredList}
          setShouldShowFilteredList={setShouldShowFilteredList}
        />
      }
    >
      {upcomingSetsList?.map((upcomingSet) => (
        <SetSelectionSetItem
          key={upcomingSet.setId}
          title={formatFriendlyDate(upcomingSet.setDate)}
          titleTooltip={
            differenceInCalendarWeeks(upcomingSet.setDate, new Date(), {
              weekStartsOn: 0,
            }) < FRIENDLY_FORMAT_CALENDAR_WEEK_DIFFERENCE_THRESHOLD
              ? formatDate(upcomingSet.setDate)
              : undefined
          }
          subtitle={upcomingSet.eventType}
          label={`${upcomingSet.songCount} ${pluralize(upcomingSet.songCount, { singular: "song", plural: "songs" })}`}
          onClick={() => {
            onSetSelect({
              id: upcomingSet.setId,
              songCount: upcomingSet.songCount,
            });
          }}
        />
      ))}
    </SetSelectionSection>
  );
};
