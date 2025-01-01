"use client";

import * as React from "react";

import { cn } from "@lib/utils";
import { Button } from "@components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { CaretDown, CaretUp, Check } from "@phosphor-icons/react/dist/ssr";

export type ComboboxOption = {
  value: string;
  label: string;
};

type ComboboxProps = {
  placeholder: string;
  hasSearch?: boolean;
  searchPlaceholder?: string;
  emptyState?: React.ReactNode;
  options: ComboboxOption[];
};

export const Combobox: React.FC<React.PropsWithChildren<ComboboxProps>> = ({
  placeholder,
  hasSearch = false,
  searchPlaceholder = "Search...",
  emptyState,
  options,
  children,
}) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="min-w-[300px] max-w-full justify-between"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          {open ? (
            <CaretUp className="opacity-50" />
          ) : (
            <CaretDown className="opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[300px] p-0">
        <Command>
          {hasSearch && <CommandInput placeholder={searchPlaceholder} />}
          <CommandList>
            <CommandEmpty>{emptyState}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            {children}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
