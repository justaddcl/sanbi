import React, { useState } from "react";
import { format, isSameYear } from "date-fns";

import { Badge } from "@components/ui/badge";
import { type DatePickerValue } from "@components/ui/datePicker";
import { ScrollArea } from "@components/ui/scroll-area";
import { HStack } from "@components/HStack";
import { VStack } from "@components/VStack";
import { CreateSetForm } from "@modules/sets/components/CreateSetForm";
import {
  type SelectedSet,
  SetSelectionFilters,
} from "@modules/songs/forms/AddSongToSet/components";

import { SetSelectionAllUpcomingSets } from "./SetSelectionAllUpcomingSets";
import { SetSelectionUpcomingSets } from "./SetSelectionUpcomingSets";

type SetSelectionEventTypeFilter = {
  id: string;
  name: string;
};

export type SetSelectionEventTypeFilters = SetSelectionEventTypeFilter[];

export type SetSelectionStepProps = {
  isCreatingNewSet: boolean;
  onCreateSetClick: () => void;
  onSetSelect: (setSummary: SelectedSet) => void;
};

export const SetSelectionStep: React.FC<SetSelectionStepProps> = ({
  isCreatingNewSet,
  onCreateSetClick,
  onSetSelect,
}) => {
  const [eventTypeFilters, setEventTypeFilters] = useState<
    SetSelectionEventTypeFilter[]
  >([]);
  const [dateFilter, setDateFilter] = useState<
    DatePickerValue<"range"> | undefined
  >(undefined);

  const renderDateFilterLabel = (dateFilter: DatePickerValue<"range">) => {
    if (!dateFilter?.from) {
      return;
    }

    return dateFilter.to
      ? `${format(dateFilter.from, `LLL dd${isSameYear(dateFilter.to, dateFilter.from) ? "" : ", yyyy"}`)} -${" "}
        ${format(dateFilter.to, `LLL dd${isSameYear(dateFilter.to, dateFilter.from) ? "" : ", yyyy"}`)}`
      : format(dateFilter.from, `LLL dd`);
  };

  if (isCreatingNewSet) {
    return (
      <div className="mt-4 lg:px-10">
        <CreateSetForm
          onCreationSuccess={(newSet) => {
            onSetSelect({
              id: newSet.id,
              songCount: 0,
            });
          }}
        />
      </div>
    );
  }

  return (
    <VStack>
      <VStack className="gap-4 px-4 lg:gap-1 lg:px-10">
        <SetSelectionFilters
          eventTypeFilters={eventTypeFilters}
          setEventTypeFilter={setEventTypeFilters}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          onCreateSetClick={onCreateSetClick}
        />
        {(eventTypeFilters.length > 0 || dateFilter) && (
          <HStack className="mb-4 flex-wrap gap-2">
            {eventTypeFilters.length > 0 &&
              eventTypeFilters.map((eventType) => (
                <Badge
                  key={eventType.id}
                  variant="secondary"
                  dismissable
                  onDismiss={() => {
                    setEventTypeFilters((currentFilters) =>
                      currentFilters.filter(
                        (filter) => filter.id !== eventType.id,
                      ),
                    );
                  }}
                >
                  {eventType.name}
                </Badge>
              ))}
            {dateFilter && (
              <Badge
                variant="secondary"
                dismissable
                onDismiss={() => {
                  setDateFilter(undefined);
                }}
              >
                {renderDateFilterLabel(dateFilter)}
              </Badge>
            )}
          </HStack>
        )}
      </VStack>
      <ScrollArea>
        <VStack className="gap-4 py-4 lg:gap-6">
          <SetSelectionUpcomingSets onSetSelect={onSetSelect} />
          <SetSelectionAllUpcomingSets
            eventTypeFilters={eventTypeFilters}
            dateFilter={dateFilter}
            onCreateSetClick={onCreateSetClick}
            onSetSelect={onSetSelect}
          />
        </VStack>
      </ScrollArea>
    </VStack>
  );
};
