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
              value={field.value as string} // asserting the type since TS can't tell due to the form context
              setSelectedEventType={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
