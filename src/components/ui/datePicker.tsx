"use client";

import * as React from "react";
import { type ControllerRenderProps } from "react-hook-form";
import { CalendarBlank } from "@phosphor-icons/react";
import { addDays, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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

export type DatePickerPreset = {
  value: string;
  label: string;
};

type DatePickerProps = ControllerRenderProps<{ date: string }, "date"> & {
  presets?: DatePickerPreset[];
  initialDate?: Date;
  presetSelectPlaceholder?: string;
};

export const DatePicker: React.FC<DatePickerProps> = ({
  presets,
  initialDate,
  presetSelectPlaceholder = "Quick select date",
  ...props
}) => {
  const [date, setDate] = React.useState<Date | undefined>(initialDate);
  const [open, setOpen] = React.useState(false);
  const [viewMonth, setViewMonth] = React.useState<Date>(
    initialDate ?? new Date(),
  );

  const onDateChange = (selectedDate: Date | undefined, closePicker = true) => {
    const formattedDate = selectedDate?.toLocaleDateString("en-CA");
    setDate(selectedDate);
    props.onChange?.(formattedDate);
    if (closePicker) {
      setOpen(false);
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
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
        {!!presets && (
          <Select
            onValueChange={(value) => {
              const presetOffset = parseInt(value);
              const selectedDate = addDays(new Date(), presetOffset);
              onDateChange(selectedDate);
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
        <div className="rounded-md border">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => onDateChange(selectedDate)}
            month={viewMonth}
            onMonthChange={setViewMonth}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
