import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@components/ui/form";
import { EventTypeSelect } from "@modules/eventTypes/components/EventTypeSelect";

export const SetEventTypeSelectFormField: React.FC = () => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="eventTypeId"
      render={({ field }) => (
        <FormItem className="flex flex-col gap-2">
          <FormLabel>Event type *</FormLabel>
          <FormControl>
            <EventTypeSelect
              value={typeof field.value === "string" ? field.value : ""}
              onSelectChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
