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
import { api } from "@/trpc/react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { skipToken } from "@tanstack/react-query";

const createSetFormSchema = insertSetSchema.pick({
  date: true,
  eventTypeId: true,
});
export type CreateSetFormFields = z.infer<typeof createSetFormSchema>;

type CreateSetFormProps = {
  onSubmit: () => void;
};

export const CreateSetForm: React.FC<CreateSetFormProps> = ({ onSubmit }) => {
  const router = useRouter();
  const { userId } = useAuth();

  const createSetForm = useForm<CreateSetFormFields>({
    resolver: zodResolver(createSetFormSchema),
    defaultValues: {
      date: undefined,
      eventTypeId: undefined,
    },
    mode: "onChange",
  });

  const createSetMutation = api.set.create.useMutation();

  if (!userId) {
    return null;
  }

  const { data: userData, isError } = api.user.getUser.useQuery({ userId });

  const {
    data: eventTypeData,
    isError: eventTypeQueryError,
    isFetching: isEventTypeQueryFetching,
    isFetched: isEventTypeQueryFetched,
  } = api.eventType.getEventTypes.useQuery(
    userData?.memberships[0]
      ? { organizationId: userData.memberships[0].organizationId }
      : skipToken,
  );

  const handleCreateSetSubmit = async (formValues: CreateSetFormFields) => {
    const { date, eventTypeId } = formValues;

    if (!isError && userData) {
      const organizationMembership = userData.memberships[0];

      if (!organizationMembership) {
        return;
      }

      await createSetMutation.mutateAsync(
        {
          date,
          eventTypeId,
          organizationId: organizationMembership.organizationId,
          isArchived: false,
        },
        {
          onSuccess(data) {
            console.log("🤖 [createSetMutation/onSuccess] ~ data:", data);
            const [newSet] = data;

            toast.success("Set was created");
            router.push(
              `/${organizationMembership.organizationId}/sets/${newSet?.id}`,
            );
          },
          onError(error) {
            console.log("🤖 [createSetMutation/onError] ~ error:", error);
            toast.error(`Could not create set: ${error.message}`);
          },
        },
      );
      onSubmit?.();
    }
  };

  const {
    formState: { isDirty, isSubmitting, isValid },
  } = createSetForm;

  const shouldSubmitBeDisabled = !isDirty || !isValid || isSubmitting;

  // TODO: finalize what the presets should be
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
                <>
                  {/* TODO: add skeleton when still fetching event types */}
                  {isEventTypeQueryFetching && (
                    <Text>Loading event types...</Text>
                  )}
                  {isEventTypeQueryFetched && (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {!eventTypeQueryError &&
                          eventTypeData?.map((eventType) => (
                            <SelectItem key={eventType.id} value={eventType.id}>
                              {eventType.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </>
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
