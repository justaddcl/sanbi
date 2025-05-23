"use client";

import * as React from "react";
import { type DateRange } from "react-day-picker";
import { type ControllerRenderProps } from "react-hook-form";
import { CalendarBlank, X } from "@phosphor-icons/react";
import { addDays, format, isSameYear } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  CalendarMultiple,
  CalendarRange,
  CalendarSingle,
} from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const DATE_FORMAT = "PPP";

export type CalendarMode = "single" | "multiple" | "range";

export type DatePickerPreset = {
  value: string;
  label: string;
};

const isDateArray = (value: Date | Date[] | DateRange): value is Date[] =>
  Array.isArray(value) && value.every((d) => d instanceof Date);

const isDateRange = (value: Date | Date[] | DateRange): value is DateRange =>
  typeof value === "object" &&
  value !== null &&
  // must have a "from" property that is a Date (or undefined)
  "from" in value &&
  // at runtime v.from is either undefined or actually an instanceof Date
  (value.from === undefined || value.from instanceof Date);

export type DatePickerValue<Mode extends CalendarMode = "single"> =
  Mode extends "single" ? Date : Mode extends "multiple" ? Date[] : DateRange;

const getDatePickerLabel = <Mode extends CalendarMode = "single">(
  placeholder: DatePickerProps["placeholder"],
  date: DatePickerValue<Mode> | undefined,
  mode: Mode,
): string => {
  if (!date) {
    return placeholder ?? "Pick a date";
  }

  if (mode === "single") {
    return format(date as DatePickerValue<"single">, DATE_FORMAT);
  }

  if (mode === "multiple") {
    return (date as DatePickerValue<"multiple">)
      .map((individualDate) => format(individualDate, DATE_FORMAT))
      .join(", ");
  }

  if (mode === "range") {
    const range = date as DateRange;
    return range.from
      ? range.to
        ? `${format(range.from, `LLL dd${isSameYear(range.to, range.from) ? "" : ", yyyy"}`)} -${" "}
          ${format(range.to, `LLL dd${isSameYear(range.to, range.from) ? "" : ", yyyy"}`)}`
        : format(range.from, `LLL dd`)
      : "Pick a date";
  }

  return format(date as DatePickerValue<"single">, DATE_FORMAT);
};

type DatePickerProps<Mode extends CalendarMode = "single"> = Partial<
  Pick<ControllerRenderProps<{ date: string }, "date">, "ref" | "onChange">
> & {
  presets?: DatePickerPreset[];
  initialDate?: DatePickerValue<Mode>;
  presetSelectPlaceholder?: string;
  mode?: Mode;
  placeholder?: string;
  date?: DatePickerValue<Mode>;
};

export const DatePicker = <Mode extends CalendarMode = "single">({
  presets,
  initialDate,
  presetSelectPlaceholder = "Quick select date",
  mode = "single" as Mode,
  placeholder,
  date,
  onChange,
  ...props
}: DatePickerProps<Mode>) => {
  const [open, setOpen] = React.useState(false);
  const [viewMonth, setViewMonth] = React.useState<Date>(() => {
    if (!initialDate) {
      return new Date();
    }

    if (isDateArray(initialDate)) {
      return initialDate[0] ?? new Date();
    }

    if (isDateRange(initialDate)) {
      return initialDate.from ?? new Date();
    }

    return initialDate ?? new Date();
  });

  const onDateChange = (
    selectedDate: DatePickerValue<Mode> | undefined,
    closePicker = true,
  ) => {
    const formattedDate = (selectedDate: DatePickerValue<Mode>) => {
      if (isDateArray(selectedDate)) {
        return selectedDate.map((date) => date.toLocaleDateString("en-CA"));
      }

      if (isDateRange(selectedDate)) {
        return {
          to: selectedDate.to?.toLocaleDateString("en-CA"),
          from: selectedDate.from?.toLocaleDateString("en-CA"),
        };
      }

      return selectedDate?.toLocaleDateString("en-CA");
    };
    onChange?.(selectedDate);
    if (closePicker) {
      setOpen(false);
    }
  };

  const renderCalendarVariant = (mode: Mode) => {
    if (mode === "single") {
      return (
        <CalendarSingle
          selected={date as Date}
          onSelect={(value) =>
            value && onDateChange(value as DatePickerValue<Mode>)
          }
          month={viewMonth}
          onMonthChange={setViewMonth}
        />
      );
    }
    if (mode === "multiple") {
      return (
        <CalendarMultiple
          selected={date as Date[]}
          onSelect={(value) =>
            value && onDateChange(value as DatePickerValue<Mode>)
          }
          month={viewMonth}
          onMonthChange={setViewMonth}
        />
      );
    }
    if (mode === "range") {
      return (
        <CalendarRange
          selected={date as DateRange}
          onSelect={(value) =>
            value && onDateChange(value as DatePickerValue<Mode>)
          }
          month={viewMonth}
          onMonthChange={setViewMonth}
        />
      );
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarBlank className="mr-2 h-4 w-4" />
          {getDatePickerLabel(placeholder, date, mode)}
          {date && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={(clickEvent) => {
                clickEvent.stopPropagation();
                onDateChange(undefined);
              }}
            >
              <X />
            </Button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
        {!!presets && mode === "single" && (
          <Select
            onValueChange={(value) => {
              const presetOffset = parseInt(value);
              const selectedDate = addDays(new Date(), presetOffset);
              onDateChange(selectedDate as DatePickerValue<Mode>);
              setViewMonth(selectedDate);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={presetSelectPlaceholder} />
            </SelectTrigger>
            <SelectContent position="popper">
              {presets?.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="rounded-md border">{renderCalendarVariant(mode)}</div>
      </PopoverContent>
    </Popover>
  );
};
