import { useFormContext } from "react-hook-form";

import {
  DatePicker,
  type DatePickerValue,
} from "@components/ui/datePicker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@components/ui/form";

import { getSetDatePickerPresets } from "./getSetDatePickerPresets";

export const SetDatePickerFormField: React.FC = () => {
  const { control } = useFormContext();
  const datePresets = getSetDatePickerPresets();

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
              date={
                field.value
                  ? new Date(field.value as DatePickerValue<"single">)
                  : undefined
              }
              onChange={(selectedDate: DatePickerValue<"single">) => {
                field.onChange(
                  selectedDate?.toLocaleDateString("en-CA") ?? undefined,
                );
              }}
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
