import { DatePicker, type DatePickerPreset } from "@components/ui/datePicker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@components/ui/form";
import { getFirstSundayOfNextMonth } from "@lib/date/getFirstSundayOfNextMonth";
import { addWeeks, differenceInCalendarDays, nextSunday } from "date-fns";
import { useFormContext } from "react-hook-form";

export const SetDatePickerFormField: React.FC = () => {
  const { control } = useFormContext();

  const upcomingSunday = nextSunday(new Date());
  const upcomingSundayInDays = differenceInCalendarDays(
    upcomingSunday,
    new Date(),
  );
  const sundayAfterNextInDays = differenceInCalendarDays(
    addWeeks(upcomingSunday, 1),
    new Date(),
  );

  const firstSundayOfNextMonthInDays = differenceInCalendarDays(
    getFirstSundayOfNextMonth(),
    new Date(),
  );

  const datePresets: DatePickerPreset[] = [
    {
      value: `${upcomingSundayInDays}`,
      label: "Upcoming Sunday",
    },
    { value: `${sundayAfterNextInDays}`, label: "Sunday After Next" },
    {
      value: `${firstSundayOfNextMonthInDays}`,
      label: "First Sunday of Next Month",
    },
  ];
  return (
    <FormField
      control={control}
      name="date"
      render={({ field }) => (
        <FormItem className="flex flex-col gap-2">
          <FormLabel>Set date *</FormLabel>
          <FormControl>
            <DatePicker
              {...field}
              presets={datePresets}
              initialDate={field.value as Date} // technically, this is a string, but this satisfies TS and works..
              // also, asserting the type since TS can't tell since we're using form context
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
