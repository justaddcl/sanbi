import React from "react";

import { Badge } from "@components/ui/badge";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { formatFriendlyDate } from "@lib/date";
import { pluralize } from "@lib/string";
import { type RouterOutputs } from "@/trpc/react";

type SelectedSetCardProps = {
  set: RouterOutputs["set"]["get"];
};

export const SelectedSetCard: React.FC<SelectedSetCardProps> = ({ set }) => {
  const setSectionsCount = set.sections.length;

  return (
    <VStack className="gap-1">
      <Text className="font-medium text-slate-700">Selected set</Text>
      <HStack className="items-center justify-between rounded-lg border border-slate-200 p-3">
        <VStack>
          <Text className="font-medium md:text-lg">
            {formatFriendlyDate(set.date)}
          </Text>
          <Text className="text-sm text-slate-500">{set.eventType.name}</Text>
        </VStack>
        <Badge variant="secondary">
          {`${setSectionsCount} ${pluralize(setSectionsCount, { singular: "section", plural: "sections" })}`}
        </Badge>
      </HStack>
    </VStack>
  );
};
