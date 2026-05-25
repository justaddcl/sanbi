"use client";

import * as React from "react";
import {
  type ChevronProps,
  DayPicker,
  type DayPickerProps,
type PropsBase,
  type PropsMulti,
  type PropsRange,
  type PropsSingle,
} from "react-day-picker";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

import { cn } from "@lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = DayPickerProps;
type CalendarSingleProps = Omit<PropsBase & PropsSingle, "mode">;
type CalendarMultipleProps = Omit<PropsBase & PropsMulti, "mode">;
type CalendarRangeProps = Omit<PropsBase & PropsRange, "mode">;

const baseClassNames: PropsBase["classNames"] = {
  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
  month: "space-y-4",
  month_caption: "flex justify-center pt-1 relative items-center",
  caption_label: "text-sm font-medium",
  nav: "space-x-1 flex items-center",
  button_previous: cn(
    buttonVariants({ variant: "outline" }),
    "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
  ),
  button_next: cn(
    buttonVariants({ variant: "outline" }),
    "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
  ),
  month_grid: "w-full border-collapse space-y-1",
  weekdays: "flex",
  weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
  week: "flex w-full mt-2",
  day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].range_end)]:rounded-r-md [&:has([aria-selected].outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
  day_button: cn(
    buttonVariants({ variant: "ghost" }),
    "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
  ),
  range_end: "range_end",
  selected:
    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
  today: "bg-accent text-accent-foreground",
  outside:
    "outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
  disabled: "text-muted-foreground opacity-50",
  range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
  hidden: "invisible",
};

const baseComponents: DayPickerProps["components"] = {
  Chevron: ({ orientation, className }: ChevronProps) =>
    orientation === "left" ? (
      <CaretLeft className={cn("h-4 w-4", className)} />
    ) : (
      <CaretRight className={cn("h-4 w-4", className)} />
    ),
};

export function CalendarSingle(props: CalendarSingleProps) {
  return (
    <DayPicker
      {...props}
      mode="single"
      showOutsideDays={true}
      className={cn("p-3", props.className)}
      classNames={{ ...baseClassNames, ...props.classNames }}
      components={baseComponents}
    />
  );
}

export function CalendarMultiple(props: CalendarMultipleProps) {
  return (
    <DayPicker
      {...props}
      mode="multiple"
      showOutsideDays={true}
      className={cn("p-3", props.className)}
      classNames={{ ...baseClassNames, ...props.classNames }}
      components={baseComponents}
    />
  );
}

export function CalendarRange(props: CalendarRangeProps) {
  return (
    <DayPicker
      {...props}
      mode="range"
      showOutsideDays={true}
      className={cn("p-3", props.className)}
      classNames={{ ...baseClassNames, ...props.classNames }}
      components={baseComponents}
    />
  );
}

// For backward compatibility
export const Calendar = CalendarSingle;
