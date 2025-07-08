"use client";

import * as React from "react";
import { CaretDown } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@lib/utils";

export type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  label: React.ReactNode;
  options: MultiSelectOption[];
  selected: string[];
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
        {options.map((option) => (
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
