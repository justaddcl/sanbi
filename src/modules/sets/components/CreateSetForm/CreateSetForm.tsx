"use client";

import { api } from "@/trpc/react";
import { useAuth } from "@clerk/nextjs";
import { Text } from "@components/Text";
import { Button } from "@components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Textarea } from "@components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSetSchema } from "@lib/types/zod";
import { skipToken } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";
import { SetDatePickerFormField } from "../forms/SetDatePickerFormField";
import { SetEventTypeSelectFormField } from "../forms/SetEventTypeSelectFormField";

const createSetFormSchema = insertSetSchema.pick({
  date: true,
  eventTypeId: true,
  notes: true,
});
export type CreateSetFormFields = Omit<
  z.infer<typeof createSetFormSchema>,
  "notes"
> & {
  notes: NonNullable<z.infer<typeof createSetFormSchema>["notes"]>;
};

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
      notes: "",
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
    const toastId = toast.loading("Creating set...");
    const { date, eventTypeId, notes } = formValues;

    if (!isError && userData) {
      const organizationMembership = userData.memberships[0];

      if (!organizationMembership) {
        return;
      }

      await createSetMutation.mutateAsync(
        {
          date,
          eventTypeId,
          notes: notes || null,
          organizationId: organizationMembership.organizationId,
          isArchived: false,
        },
        {
          onSuccess(data) {
            console.log("🤖 [createSetMutation/onSuccess] ~ data:", data);
            const [newSet] = data;

            toast.success("Set was created", { id: toastId });
            router.push(
              `/${organizationMembership.organizationId}/sets/${newSet?.id}`,
            );
          },
          onError(error) {
            console.log("🤖 [createSetMutation/onError] ~ error:", error);
            toast.error(`Could not create set: ${error.message}`, {
              id: toastId,
            });
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

  return (
    <FormProvider {...createSetForm}>
      <form
        onSubmit={createSetForm.handleSubmit(handleCreateSetSubmit)}
        className="mx-6 flex flex-col gap-8 pb-8 min-[1025px]:mx-0"
      >
        <SetDatePickerFormField />
        <SetEventTypeSelectFormField />
        <FormField
          control={createSetForm.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel>Set notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        {/* TODO: this was for proof of concept, but we should figure out if we want to implement it */}
        {/* <div className="flex flex-col gap-2">
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
        </div> */}
        <Button
          className="w-full"
          type="submit"
          isLoading={isSubmitting}
          disabled={shouldSubmitBeDisabled}
        >
          Create set
        </Button>
      </form>
    </FormProvider>
  );
};
