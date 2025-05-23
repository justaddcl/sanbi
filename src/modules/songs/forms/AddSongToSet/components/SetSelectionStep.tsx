import React, { useState } from "react";
import { SlidersHorizontal } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@components/ui/button";
import { ScrollArea } from "@components/ui/scroll-area";
import { VStack } from "@components/VStack";
import { SetSelectionFilters } from "@modules/songs/forms/AddSongToSet/components";

import { SetSelectionAllUpcomingSets } from "./SetSelectionAllUpcomingSets";
import { SetSelectionUpcomingSets } from "./SetSelectionUpcomingSets";
import { DatePickerValue } from "@components/ui/datePicker";

export const SetSelectionStep: React.FC = () => {
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<
    DatePickerValue<"range"> | undefined
  >(undefined);

  return (
    <VStack>
      <SetSelectionFilters
        eventTypeFilter={eventTypeFilter}
        setEventTypeFilter={setEventTypeFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />
      <ScrollArea>
        <VStack className="gap-4 py-4 lg:gap-6">
          {/* <div className="px-4">
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-start px-4 font-medium"
            >
              <Plus /> Create new set
            </Button>
          </div> */}
          <SetSelectionUpcomingSets />
          <SetSelectionAllUpcomingSets
            eventTypeFilter={eventTypeFilter}
            dateFilter={dateFilter}
          />
        </VStack>
      </ScrollArea>
    </VStack>
  );
};
