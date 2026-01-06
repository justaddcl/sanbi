import React, { type Dispatch, type SetStateAction, useState } from "react";
import { Plus, SlidersHorizontal, X } from "@phosphor-icons/react/dist/ssr";
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
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { EventTypeSelect } from "@modules/eventTypes/components";
import { type SetSelectionEventTypeFilters } from "@modules/songs/forms/AddSongToSet/components/SetSelectionStep";
import { useUserQuery } from "@modules/users/api/queries";
import { trpc } from "@lib/trpc";
import { useResponsive } from "@/hooks/useResponsive";

type SetSelectionFiltersProps = {
  eventTypeFilters: SetSelectionEventTypeFilters;
  setEventTypeFilter: Dispatch<SetStateAction<SetSelectionEventTypeFilters>>;
  dateFilter?: DatePickerValue<"range">;
  setDateFilter: Dispatch<SetStateAction<DatePickerValue<"range"> | undefined>>;
  onCreateSetClick: () => void;
};

export const SetSelectionFilters: React.FC<SetSelectionFiltersProps> = ({
  eventTypeFilters,
  setEventTypeFilter,
  dateFilter,
  setDateFilter,
  onCreateSetClick,
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
  } = trpc.eventType.getEventTypes.useQuery(
    userMembership
      ? { organizationId: userMembership.organizationId }
      : skipToken,
  );

  const isLoading = !isAuthLoaded || userQueryLoading || eventTypeQueryLoading;
  const isError = !!userQueryError || !!eventTypeQueryError;

  const eventTypeFilterIds = eventTypeFilters.map((eventType) => eventType.id);

  const handleOnSelectEventType = (eventTypeId: string) => {
    if (eventTypeFilters.some((filter) => filter.id === eventTypeId)) {
      setEventTypeFilter((currentFilters) =>
        currentFilters.filter((filter) => filter.id !== eventTypeId),
      );
    } else {
      const eventType = eventTypeData?.find(
        (eventType) => eventType.id === eventTypeId,
      );
      if (eventType) {
        setEventTypeFilter((currentFilters) => [
          ...currentFilters,
          { id: eventTypeId, name: eventType.name },
        ]);
      }
    }
  };

  if (isMobile) {
    return (
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger>
          <Button
            variant="secondary"
            className="mt-4 w-full justify-center gap-2 px-4 font-medium"
          >
            <SlidersHorizontal /> Filter sets
          </Button>
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
                      <Checkbox
                        id={eventType.id}
                        checked={eventTypeFilters.some(
                          (filter) => filter.id === eventType.id,
                        )}
                        onChange={() => handleOnSelectEventType(eventType.id)}
                      />
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
                  placeholder="Date range"
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
    <HStack className="hidden items-center justify-between gap-4 py-2 md:flex">
      <HStack className="items-center gap-4">
        <Text className="text-sm text-slate-500">Filter by:</Text>
        <HStack className="gap-2">
          <EventTypeSelect
            value={eventTypeFilterIds}
            onSelectChange={handleOnSelectEventType}
            placeholder="Event type"
            allowMultiple
          />
          <DatePicker
            mode="range"
            onChange={(selectedDate: DatePickerValue<"range">) => {
              setDateFilter(selectedDate);
            }}
            placeholder="Date range"
            alwaysShowPlaceholder
            initialDate={dateFilter}
            date={dateFilter}
            numberOfMonths={2}
          />
        </HStack>
      </HStack>
      <Button
        variant="secondary"
        size="sm"
        className="font-medium"
        onClick={onCreateSetClick}
      >
        <Plus /> Create set
      </Button>
    </HStack>
  );
};
