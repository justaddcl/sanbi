import React, {
  type Dispatch,
  type SetStateAction,
  useRef,
  useState,
} from "react";
import { skipToken } from "@tanstack/react-query";

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
import { api } from "@/trpc/react";

type EventTypeSelectProps = SelectProps & {
  setSelectedEventType: Dispatch<SetStateAction<string>>;
  placeholder?: SelectValueProps["placeholder"];
  valuePrefix?: string;
};

export const EventTypeSelect: React.FC<EventTypeSelectProps> = ({
  placeholder,
  setSelectedEventType,
  value,
  valuePrefix,
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
  } = api.eventType.getEventTypes.useQuery(
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
    setSelectedEventType(selectedEventTypeId);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  if (isError) {
    return (
      <Text>Uh oh. We couldn&apos;t get your team&apos;s event types.</Text>
    );
  }

  // const handleSelect = (selectedEventTypeId: string): void => {
  //   const eventTypeId =
  //     selectedEventTypeId === value ? "" : selectedEventTypeId;
  //   console.log("🚀 ~ EventTypeSelect.tsx:62 ~ handleSelect ~ eventTypeId:", {
  //     selectedEventTypeId,
  //     value,
  //     eventTypeId,
  //   });
  //   setSelectedEventType?.(eventTypeId);
  // };

  const displayValue = eventTypeData?.find(
    (eventType) => eventType.id === value,
  )?.name;

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
          {value && valuePrefix ? valuePrefix : null}
          {displayValue}
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
                  setSelectedEventType("");
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
