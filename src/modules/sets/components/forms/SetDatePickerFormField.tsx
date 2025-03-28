import { DatePicker, type DatePickerPreset } from "@components/ui/datePicker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@components/ui/form";
import { useFormContext } from "react-hook-form";

const datePresets: DatePickerPreset[] = [
  {
    value: "0",
    label: "Today",
  },
  { value: "1", label: "Tomorrow" },
];

export const SetDatePickerFormField: React.FC = () => {
  const { control } = useFormContext();

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
