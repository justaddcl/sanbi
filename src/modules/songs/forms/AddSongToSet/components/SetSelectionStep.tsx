import React from "react";
import { Plus } from "@phosphor-icons/react";

import { Button } from "@components/ui/button";
import { ScrollArea } from "@components/ui/scroll-area";
import { VStack } from "@components/VStack";
import { SetSelectionFilters } from "@modules/songs/forms/AddSongToSet/components";

import { SetSelectionAllUpcomingSets } from "./SetSelectionAllUpcomingSets";
import { SetSelectionUpcomingSets } from "./SetSelectionUpcomingSets";

export const SetSelectionStep: React.FC = () => {
  return (
    <VStack>
      <SetSelectionFilters />
      <ScrollArea>
        <VStack className="gap-4 py-4 lg:gap-6">
          <div className="px-4">
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-start px-4 font-medium"
            >
              <Plus /> Create new set
            </Button>
          </div>
          <SetSelectionUpcomingSets />
          <SetSelectionAllUpcomingSets />
        </VStack>
      </ScrollArea>
    </VStack>
  );
};
