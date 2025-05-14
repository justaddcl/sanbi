import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";

export const SetSelectionFilters: React.FC = () => {
  return (
    <HStack className="items-center gap-4 bg-slate-50 px-4 py-2 lg:px-10">
      <Text className="text-sm text-slate-500">Filter by:</Text>
      <HStack className="gap-2">
        {/* TODO: replace with actual event type select */}
        <Select>
          <SelectTrigger className="w-auto min-w-[120px]">
            <SelectValue placeholder="Event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sunday-service">Sunday service</SelectItem>
            <SelectItem value="team-stoneway">Team Stoneway</SelectItem>
            <SelectItem value="discipleship-community">
              Discipleship Community
            </SelectItem>
          </SelectContent>
        </Select>
        {/* TODO: replace with actual date picker */}
        <Select>
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="some-date">Some date</SelectItem>
          </SelectContent>
        </Select>
      </HStack>
    </HStack>
  );
};
