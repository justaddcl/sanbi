import React from "react";
import { Plus } from "@phosphor-icons/react";

import { Button } from "@components/ui/button";
import { VStack } from "@components/VStack";
import {
  SetSelectionFilters,
  SetSelectionSection,
  SetSelectionSetItem,
} from "@modules/songs/forms/AddSongToSet/components";
import { api } from "@/trpc/react";
import { useUserQuery } from "@modules/users/api/queries";
import { Skeleton } from "@components/ui/skeleton";
import { SetSelectionUpcomingSets } from "./SetSelectionUpcomingSets";

export const SetSelectionStep: React.FC = () => {
  return (
    <VStack>
      <SetSelectionFilters />
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
        {/* TODO: replace placeholder data */}
        <SetSelectionSection title="All sets">
          <SetSelectionSetItem
            title={"Sun, May 11"}
            subtitle={"Sunday Service"}
            label={" 3 songs"}
          />
          <SetSelectionSetItem
            title={"Sun, May 18"}
            subtitle={"Sunday Service"}
            label={"4 songs"}
          />
        </SetSelectionSection>
      </VStack>
    </VStack>
  );
};
