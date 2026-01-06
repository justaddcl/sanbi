import React, { useRef, useState } from "react";
import { skipToken } from "@tanstack/react-query";

import {
  MultiSelect,
  type MultiSelectOption,
} from "@components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  type SelectProps,
  SelectTrigger,
  SelectValue,
  type SelectValueProps,
} from "@components/ui/select";
import { Skeleton } from "@components/ui/skeleton";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { useUserQuery } from "@modules/users/api/queries";
import { trpc } from "@lib/trpc";

type EventTypeSelectBaseProps = Omit<SelectProps, "value"> & {
  onSelectChange: (eventTypeId: string) => void;
  placeholder?: SelectValueProps["placeholder"];
};

type EventTypeSingleSelectProps = EventTypeSelectBaseProps & {
  allowMultiple?: false;
  value: SelectProps["value"];
};

type EventTypeMultiSelectProps = EventTypeSelectBaseProps & {
  allowMultiple: true;
  value: NonNullable<SelectProps["value"]>[];
};

type EventTypeSelectProps =
  | EventTypeSingleSelectProps
  | EventTypeMultiSelectProps;

export const EventTypeSelect: React.FC<EventTypeSelectProps> = ({
  placeholder,
  onSelectChange,
  value,
  allowMultiple,
  ...props
}) => {
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

  const [open, setOpen] = useState(false);

  // helper ref just to avoid stale closures
  const latestValueRef = useRef(value);
  latestValueRef.current = value;

  const handleValueChange = (selectedEventTypeId: string) => {
    onSelectChange(selectedEventTypeId);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  if (isError) {
    return (
      <Text>Uh oh. We couldn&apos;t get your team&apos;s event types.</Text>
    );
  }

  const displayValue = (value?: string) => {
    if (!value) {
      return placeholder ?? "Select event type";
    }

    return eventTypeData?.find((eventType) => eventType.id === value)?.name;
  };

  if (allowMultiple) {
    const multiSelectOptions: MultiSelectOption[] =
      eventTypeData?.map((eventType) => ({
        value: eventType.id,
        label: eventType.name,
      })) ?? [];

    return (
      <MultiSelect
        label={placeholder ?? "Select event type"}
        options={multiSelectOptions}
        selected={value}
        onSelectChange={onSelectChange}
      />
    );
  }

  return (
    <Select
      open={open}
      onOpenChange={handleOpenChange}
      value={value ?? undefined}
      onValueChange={handleValueChange}
      {...props}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={placeholder ?? "Select event type"}
          aria-label={value}
        >
          {displayValue(value)}
        </SelectValue>
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
            <SelectItem
              key={eventType.id}
              value={eventType.id}
              // intercept before Radix handles selection
              onMouseDownCapture={(mouseDownEvent) => {
                if (eventType.id === latestValueRef.current) {
                  // stop Radix’s internal “same‐value” logic
                  mouseDownEvent.preventDefault();
                  mouseDownEvent.stopPropagation();
                  // close and clear
                  setOpen(false);
                  onSelectChange(eventType.id);
                }
              }}
            >
              {eventType.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
};
