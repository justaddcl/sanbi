import React, { type Dispatch, type SetStateAction, useState } from "react";
import { SlidersHorizontal, X } from "@phosphor-icons/react/dist/ssr";
import { skipToken } from "@tanstack/react-query";

import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { DatePicker, type DatePickerValue } from "@components/ui/datePicker";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { EventTypeSelect } from "@modules/eventTypes/components";
import { useUserQuery } from "@modules/users/api/queries";
import { useResponsive } from "@/hooks/useResponsive";
import { api } from "@/trpc/react";

type SetSelectionFiltersProps = {
  eventTypeFilter: string;
  setEventTypeFilter: Dispatch<SetStateAction<string>>;
  dateFilter?: DatePickerValue<"range">;
  setDateFilter: Dispatch<SetStateAction<DatePickerValue<"range"> | undefined>>;
};

export const SetSelectionFilters: React.FC<SetSelectionFiltersProps> = ({
  eventTypeFilter,
  setEventTypeFilter,
  dateFilter,
  setDateFilter,
}) => {
  const { isMobile } = useResponsive();

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

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

  if (isMobile) {
    return (
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger>
          <div className="mt-4 px-4">
            <Button
              variant="secondary"
              className="w-full justify-center gap-2 px-4 font-medium"
            >
              <SlidersHorizontal /> Filter sets
            </Button>
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="px-0">
            <HStack className="items-center justify-between">
              <DrawerTitle className="text-left font-normal">
                Filter sets
              </DrawerTitle>
              <DrawerClose>
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                >
                  <X />
                </Button>
              </DrawerClose>
            </HStack>
          </DrawerHeader>
          <VStack className="gap-8">
            {eventTypeData && eventTypeData.length > 0 && (
              <VStack className="gap-4 border-b pb-8">
                <Text className="text-base font-medium">Event type</Text>
                <VStack className="gap-1">
                  {eventTypeData.map((eventType) => (
                    <HStack key={eventType.id} className="items-center gap-3">
                      <Checkbox id={eventType.id} />
                      <label htmlFor={eventType.id} className="text-slate-900">
                        {eventType.name}
                      </label>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            )}
            <VStack className="gap-4 pb-4">
              <Text className="text-base font-medium">Set date</Text>
              <HStack className="justify-between gap-4">
                <DatePicker
                  mode="range"
                  onChange={(selectedDate: DatePickerValue<"range">) => {
                    setDateFilter(selectedDate);
                  }}
                  placeholder="Pick a date or range"
                  initialDate={dateFilter}
                  date={dateFilter}
                />
              </HStack>
            </VStack>
          </VStack>
          <DrawerFooter className="px-0">
            <DrawerClose asChild>
              <Button>See matching sets</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <HStack className="hidden items-center gap-4 bg-slate-50 px-4 py-2 md:flex lg:px-10">
      <Text className="text-sm text-slate-500">Filter by:</Text>
      <HStack className="gap-2">
        <EventTypeSelect
          value={eventTypeFilter}
          setSelectedEventType={setEventTypeFilter}
          placeholder="Event type"
          valuePrefix="Event type: "
        />
        {/* TODO: replace with actual date picker */}
        <Select>
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="some-date">Some date</SelectItem>
          </SelectContent>
        </Select>
      </HStack>
    </HStack>
  );
};
