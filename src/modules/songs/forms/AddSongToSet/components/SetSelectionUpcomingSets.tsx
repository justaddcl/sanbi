import { api } from "@/trpc/react";
import { Skeleton } from "@components/ui/skeleton";
import { pluralize } from "@lib/string";
import {
  SetSelectionSection,
  SetSelectionSetItem,
} from "@modules/songs/forms/AddSongToSet/components";
import { useUserQuery } from "@modules/users/api/queries";
import {
  differenceInCalendarWeeks,
  format,
  isToday,
  isTomorrow,
} from "date-fns";
import { toast } from "sonner";

export const SetSelectionUpcomingSets: React.FC = () => {
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

  if (isUpcomingSetsQueryLoading) {
    return <Skeleton />;
  }

  if (!!upcomingSetsQueryError || !upcomingSetsData) {
    // TODO: how do we better handle this?
    toast.error(
      `Ran into an issue when trying to find the upcoming sets${!!upcomingSetsQueryError ? `: ${upcomingSetsQueryError.message}` : ""}`,
    );
    return null;
  }

  // TODO: move to utils and add tests
  const formatFriendlyDate = (date: string) => {
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

  return (
    <SetSelectionSection title="Upcoming sets" label="Show more">
      {upcomingSetsData?.map((upcomingSet) => (
        <SetSelectionSetItem
          key={upcomingSet.setId}
          title={formatFriendlyDate(upcomingSet.setDate)}
          subtitle={upcomingSet.eventType}
          label={`${upcomingSet.songCount} ${pluralize(upcomingSet.songCount, { singular: "song", plural: "songs" })}`}
        />
      ))}
    </SetSelectionSection>
  );
};
