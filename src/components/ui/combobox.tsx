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
import { Text } from "@components/Text";
import {
  CaretDown,
  CaretUp,
  Check,
  CircleNotch,
} from "@phosphor-icons/react/dist/ssr";

export type ComboboxOption = {
  id: string;
  label: string;
};

type ComboboxProps = {
  placeholder: string;
  hasSearch?: boolean;
  searchPlaceholder?: string;
  emptyState?: React.ReactNode;
  options: ComboboxOption[];
  value: ComboboxOption | null;
  onChange: (selectedOption: ComboboxProps["value"]) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<ComboboxProps["open"]>>;
  loading?: boolean;
  disabled?: boolean;
};

export const Combobox: React.FC<React.PropsWithChildren<ComboboxProps>> = ({
  placeholder,
  hasSearch = false,
  searchPlaceholder = "Search...",
  emptyState,
  options,
  value,
  onChange,
  open,
  setOpen,
  loading = false,
  disabled = false,
  children,
}) => {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="min-w-[300px] max-w-full justify-between"
          disabled={disabled}
        >
          <Text>
            {value
              ? options.find((option) => {
                  return option.id === value.id;
                })?.label
              : placeholder}
          </Text>
          {loading && (
            <CircleNotch size={12} className="mr-2 h-4 w-4 animate-spin" />
          )}
          {!loading && open && <CaretUp className="opacity-50" />}
          {!loading && !open && <CaretDown className="opacity-50" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[300px] overflow-y-scroll p-0">
        <Command>
          {hasSearch && <CommandInput placeholder={searchPlaceholder} />}
          <CommandList className="max-h-dvh">
            <CommandEmpty>{emptyState}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.id === value?.id ? null : option);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value && value.id === option.id
                        ? "opacity-100"
                        : "opacity-0",
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
