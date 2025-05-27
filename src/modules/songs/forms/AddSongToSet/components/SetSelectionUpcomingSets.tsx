import { useState } from "react";
import { Funnel } from "@phosphor-icons/react";
import {
  differenceInCalendarWeeks,
  format,
  isToday,
  isTomorrow,
} from "date-fns";
import { toast } from "sonner";

import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { HStack } from "@components/HStack";
import { VStack } from "@components/VStack";
import {
  SetSelectionSection,
  SetSelectionSetItem,
  type SetSelectionStepProps,
} from "@modules/songs/forms/AddSongToSet/components";
import { useUserQuery } from "@modules/users/api/queries";
import { pluralize } from "@lib/string";
import { api } from "@/trpc/react";

// TODO: move to utils and add tests
export const formatFriendlyDate = (date: string) => {
  if (isToday(date)) {
    return "Today";
  }

  if (isTomorrow(date)) {
    return "Tomorrow";
  }

  const weekDiff = differenceInCalendarWeeks(date, new Date(), {
    weekStartsOn: 0,
  });
  if (weekDiff === 0) {
    return `This ${format(date, "EEEE")}`;
  }

  if (weekDiff === 1) {
    return `Next ${format(date, "EEEE")}`;
  }

  return format(date, "EEEE, MMM dd");
};

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
  } = useUserQuery();
  const userMembership = userData?.memberships[0];

  if (!userMembership) {
    // TODO: how do we best handle this case?
    return null;
  }

  const {
    data: upcomingSetsData,
    isLoading: isUpcomingSetsQueryLoading,
    error: upcomingSetsQueryError,
  } = api.set.getUpcoming.useQuery({
    organizationId: userMembership?.organizationId,
  });

  const upcomingSetsList = shouldShowFilteredList
    ? upcomingSetsData?.filter((upcomingSet) => !!upcomingSet.favoritedAt)
    : upcomingSetsData;

  // FIXME: add skeleton to mimic mobile styles
  if (isUpcomingSetsQueryLoading) {
    return (
      <SetSelectionSection title="Next sets" label="Show more">
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

  if (!!upcomingSetsQueryError || !upcomingSetsData) {
    // TODO: how do we better handle this?
    toast.error(
      `Ran into an issue when trying to find the upcoming sets${!!upcomingSetsQueryError ? `: ${upcomingSetsQueryError.message}` : ""}`,
    );
    return null;
  }

  const SetSelectionUpcomingSetsLabel = () => {
    return (
      <Button size="sm" variant="ghost">
        <HStack
          className="items-center gap-1"
          onClick={() =>
            setShouldShowFilteredList(
              (shouldShowFilteredList) => !shouldShowFilteredList,
            )
          }
        >
          <Funnel />
          See {shouldShowFilteredList ? "all" : "only favorites"}
        </HStack>
      </Button>
    );
  };

  return (
    <SetSelectionSection
      title="Next sets"
      label={<SetSelectionUpcomingSetsLabel />}
    >
      {upcomingSetsList?.map((upcomingSet) => (
        <SetSelectionSetItem
          key={upcomingSet.setId}
          title={formatFriendlyDate(upcomingSet.setDate)}
          subtitle={upcomingSet.eventType}
          label={`${upcomingSet.songCount} ${pluralize(upcomingSet.songCount, { singular: "song", plural: "songs" })}`}
          onClick={() => {
            onSetSelect(upcomingSet.setId);
          }}
        />
      ))}
    </SetSelectionSection>
  );
};
