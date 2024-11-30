"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
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
import { type ControllerRenderProps } from "react-hook-form";

export type DatePickerPreset = {
  value: string;
  label: string;
};

// TODO: add closeAfterSelect boolean prop
type DatePickerProps = ControllerRenderProps<
  {
    date: string;
  },
  "date"
> & {
  presets?: DatePickerPreset[];
  initialDate?: Date;
};

export const DatePicker: React.FC<DatePickerProps> = ({
  presets,
  initialDate,
  ...props
}) => {
  const [date, setDate] = React.useState<Date | undefined>(initialDate);

  const onDateChange = (selectedDate: Date | undefined) => {
    const formattedDate = selectedDate?.toLocaleDateString("en-CA");
    setDate(selectedDate);
    props.onChange?.(formattedDate);
    // TODO: if closeAfterSelect, close the popover after date is selected
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
        {!!presets && (
          <Select
            onValueChange={(value) => {
              const selectedDate = addDays(new Date(), parseInt(value));
              return onDateChange(selectedDate);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
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
          <Calendar mode="single" selected={date} onSelect={onDateChange} />
        </div>
      </PopoverContent>
    </Popover>
  );
};
