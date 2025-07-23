"use client";

import * as React from "react";
import { CaretDown } from "@phosphor-icons/react";

import { cn } from "@lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  label: React.ReactNode;
  options: MultiSelectOption[];
  selected: string[];
  // TODO: update callback for better usability - possibly onSelectChange: (newSelected: string[], clickedValue: string) => void;?
  // this will return all selected values (since this is a multi-select) along with the value that was just clicked
  onSelectChange: (selectedValue: string) => void;
  className?: string;
};

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selected,
  onSelectChange,
  className,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {label}
          <CaretDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("w-56", className)}>
        {/* TODO: add an empty/fallback state */}
        {options.length > 0 &&
          options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selected.includes(option.value)}
              onCheckedChange={() => onSelectChange(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
