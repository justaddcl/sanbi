import { api } from "@/trpc/react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Skeleton } from "@components/ui/skeleton";
import { VStack } from "@components/VStack";
import { useUserQuery } from "@modules/users/api/queries";
import { skipToken } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { Text } from "@components/Text";

export const SetEventTypeSelectFormField: React.FC = () => {
  const { control } = useFormContext();

  const {
    data: userData,
    error: userQueryError,
    isLoading: userQueryLoading,
    isAuthLoaded,
  } = useUserQuery();
  const userMembership = userData?.memberships[0];

  const {
    data: eventTypeData,
    isError: eventTypeQueryError,
    isLoading: eventTypeQueryLoading,
  } = api.eventType.getEventTypes.useQuery(
    userMembership
      ? { organizationId: userMembership.organizationId }
      : skipToken,
  );

  const isLoading = !isAuthLoaded || userQueryLoading || eventTypeQueryLoading;
  const isError = !!userQueryError || !!eventTypeQueryError;

  if (isError) {
    return (
      <Text>Uh oh. We couldn&apos;t get your team&apos;s event types.</Text>
    );
  }

  return (
    <FormField
      control={control}
      name="eventTypeId"
      render={({ field }) => (
        <FormItem className="flex flex-col gap-2">
          <FormLabel>Event type *</FormLabel>
          <FormControl>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {isLoading && (
                  <VStack className="gap-3 py-3">
                    <div className="pl-8 pr-2">
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="pl-8 pr-2">
                      <Skeleton className="h-4 w-2/5" />
                    </div>
                    <div className="pl-8 pr-2">
                      <Skeleton className="h-4 w-3/5" />
                    </div>
                  </VStack>
                )}
                {!isLoading &&
                  eventTypeData?.map((eventType) => (
                    <SelectItem key={eventType.id} value={eventType.id}>
                      {eventType.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
};
