import { type Dispatch, type SetStateAction } from "react";
import { Funnel } from "@phosphor-icons/react";

import { Button } from "@components/ui/button";
import { HStack } from "@components/HStack";

type SetSelectionUpcomingSetsLabelProps = {
  shouldShowFilteredList: boolean;
  setShouldShowFilteredList: Dispatch<SetStateAction<boolean>>;
};

export const SetSelectionUpcomingSetsLabel: React.FC<
  SetSelectionUpcomingSetsLabelProps
> = ({ shouldShowFilteredList, setShouldShowFilteredList }) => {
  return (
    <Button size="sm" variant="ghost">
      <HStack
        className="items-center gap-1"
        onClick={() =>
          setShouldShowFilteredList(
            (shouldShowFilteredList) => !shouldShowFilteredList,
          )
        }
      >
        <Funnel />
        See {shouldShowFilteredList ? "all" : "only favorites"}
      </HStack>
    </Button>
  );
};
