"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Text } from "@components/Text";
import { Button } from "@components/ui/button";
import { DatePicker, type DatePickerPreset } from "@components/ui/datePicker";
import { Switch } from "@components/ui/switch";
import { Label } from "@components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion";
import { useForm } from "react-hook-form";
import { insertSetSchema } from "@/lib/types/zod";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@components/ui/form";

const createSetFormSchema = insertSetSchema.pick({
  date: true,
  eventTypeId: true,
});
export type CreateSetFormFields = z.infer<typeof createSetFormSchema>;

type CreateSetFormProps = {
  onSubmit: () => void;
};

export const CreateSetForm: React.FC<CreateSetFormProps> = ({ onSubmit }) => {
  const createSetForm = useForm<CreateSetFormFields>({
    resolver: zodResolver(createSetFormSchema),
    defaultValues: {
      date: undefined,
      eventTypeId: undefined,
    },
    mode: "onChange",
  });

  const handleCreateSetSubmit = (formValues: CreateSetFormFields) => {
    console.log("🚀 ~ handleCreateSetSubmit ~ formValues:", formValues);

    // attempt to create set

    // handle any errors

    // use toast to show communicate success/error

    // close the dialog
    onSubmit?.();
  };

  const {
    formState: { isDirty, isSubmitting, isValid },
    setError,
  } = createSetForm;

  const shouldSubmitBeDisabled = !isDirty || !isValid || isSubmitting;

  // TODO: finalise what the presets should be
  // upcoming Sunday?
  const datePresets: DatePickerPreset[] = [
    {
      value: "0",
      label: "Today",
    },
    { value: "1", label: "Tomorrow" },
  ];

  return (
    <Form {...createSetForm}>
      <form
        onSubmit={createSetForm.handleSubmit(handleCreateSetSubmit)}
        className="mx-6 flex flex-col gap-8 pb-8 min-[1025px]:mx-0"
      >
        <FormField
          control={createSetForm.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel>Set date *</FormLabel>
              <FormControl>
                <DatePicker {...field} presets={datePresets} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={createSetForm.control}
          name="eventTypeId"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel>Event type *</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: populate with event types from database */}
                    {/* FIXME: need to add organization ID to event types table */}
                    <SelectItem value="2ba39984-bde0-4f5e-918a-900cf2e3c961">
                      Sunday service
                    </SelectItem>
                    <SelectItem value="5bce3a94-a8c9-41d7-bd9e-85f4d1f37215">
                      Team meeting
                    </SelectItem>
                    <SelectItem value="e6a2307f-6ba8-4a3f-836e-ee2ee98a3537">
                      Discipleship Community
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="start-with-last-set-toggle">
              Start with last week&apos;s set
            </Label>
            <Switch id="start-with-last-set-toggle" />
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem value="last-set">
              <AccordionTrigger>
                <Text>See last set</Text>
              </AccordionTrigger>
              <AccordionContent>Last set&apos;s songs here</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <Button
          className="w-full"
          type="submit"
          isLoading={isSubmitting}
          disabled={shouldSubmitBeDisabled}
        >
          Create set
        </Button>
      </form>
    </Form>
  );
};
