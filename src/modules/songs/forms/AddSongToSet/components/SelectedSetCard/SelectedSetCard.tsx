import React from "react";
import { differenceInCalendarWeeks } from "date-fns";

import { Badge } from "@components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@components/ui/tooltip";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import {
  formatDate,
  formatFriendlyDate,
  FRIENDLY_FORMAT_CALENDAR_WEEK_DIFFERENCE_THRESHOLD,
} from "@lib/date";
import { pluralize } from "@lib/string";
import { type RouterOutputs } from "@lib/trpc";

type SelectedSetCardProps = {
  set: RouterOutputs["set"]["get"];
  countShown?: "sections" | "songs";
};

export const SelectedSetCard: React.FC<SelectedSetCardProps> = ({
  set,
  countShown,
}) => {
  const setSectionsCount = set.sections.length;
  const setSectionSongsCount =
    set.sections.reduce(
      (songCount, section) => songCount + section.songs.length,
      0,
    ) + 1; // +1 to account for the song about to be added

  const { itemsCount, singular, plural } = {
    itemsCount:
      countShown === "songs" ? setSectionSongsCount : setSectionsCount,
    singular: countShown === "songs" ? "song" : "section",
    plural: countShown === "songs" ? "songs" : "sections",
  };

  const shouldShowDateTooltip =
    differenceInCalendarWeeks(set.date, new Date(), {
      weekStartsOn: 0,
    }) < FRIENDLY_FORMAT_CALENDAR_WEEK_DIFFERENCE_THRESHOLD;

  return (
    <HStack className="items-center justify-between rounded-lg border border-slate-200 p-3">
      <VStack>
        {shouldShowDateTooltip ? (
          <Tooltip>
            <TooltipTrigger>
              <Text className="font-medium md:text-lg">
                {formatFriendlyDate(set.date)}
              </Text>
            </TooltipTrigger>
            <TooltipContent>{formatDate(set.date)}</TooltipContent>
          </Tooltip>
        ) : (
          <Text className="font-medium md:text-lg">
            {formatFriendlyDate(set.date)}
          </Text>
        )}
        <Text className="text-sm text-slate-500">{set.eventType.name}</Text>
      </VStack>
      <Badge variant="secondary">
        {`${itemsCount} ${pluralize(itemsCount, { singular, plural })}`}
      </Badge>
    </HStack>
  );
};
