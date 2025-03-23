import { api } from "@/trpc/react";
import { HStack } from "@components/HStack";
import { Button } from "@components/ui/button";
import { VStack } from "@components/VStack";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SetWithSectionsSongsAndEventType } from "@lib/types";
import { updateSetDetailsSchema } from "@lib/types/zod";
import { type CreateSetFormFields } from "@modules/sets/components/CreateSetForm";
import { SetDatePickerFormField } from "@modules/sets/components/forms/SetDatePickerFormField";
import { useUserQuery } from "@modules/users/api/queries";
import { type Dispatch, type SetStateAction } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { SetEventTypeSelectFormField } from "./SetEventTypeSelectFormField";

const editSetDetailsFormSchema = updateSetDetailsSchema.pick({
  date: true,
  eventTypeId: true,
});

export type EditSetDetailsFields = Omit<CreateSetFormFields, "notes">;

export type EditSetDetailsFormProps = {
  set: SetWithSectionsSongsAndEventType;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

export const EditSetDetailsForm: React.FC<EditSetDetailsFormProps> = ({
  set,
  setIsEditing,
}) => {
  const updateSetDetailsMutation = api.set.updateDetails.useMutation();
  const apiUtils = api.useUtils();

  const {
    data: userData,
    error: userQueryError,
    isLoading: userQueryLoading,
    isAuthLoaded,
  } = useUserQuery();
  const userMembership = userData?.memberships[0];

  const editSetDetailsForm = useForm<EditSetDetailsFields>({
    resolver: zodResolver(editSetDetailsFormSchema),
    defaultValues: {
      date: set.date,
      eventTypeId: set.eventTypeId,
    },
    mode: "onChange",
  });

  if (!!userQueryError || !userData || !userMembership) {
    // FIXME: show an error here instead?
    return;
  }

  const {
    formState: { isDirty, isValid },
  } = editSetDetailsForm;

  const isSubmitDisabled =
    !isDirty || !isValid || userQueryLoading || !isAuthLoaded;

  const handleEditSetDetails = (formValues: EditSetDetailsFields) => {
    const { date, eventTypeId } = formValues;
    const toastId = toast("Updating set details...");

    updateSetDetailsMutation.mutate(
      {
        organizationId: userMembership.organizationId,
        setId: set.id,
        date,
        eventTypeId,
      },
      {
        async onSuccess() {
          setIsEditing(false);
          toast.success("Updated set details!", { id: toastId });
          await apiUtils.set.get.invalidate({
            setId: set.id,
            organizationId: userMembership.organizationId,
          });
        },
        onError(updateError) {
          toast.error(`Could not update set details: ${updateError.message}`, {
            id: toastId,
          });
        },
      },
    );
  };

  return (
    <FormProvider {...editSetDetailsForm}>
      <form onSubmit={editSetDetailsForm.handleSubmit(handleEditSetDetails)}>
        <VStack className="mx-6 gap-6">
          <SetDatePickerFormField />
          <SetEventTypeSelectFormField />
          <HStack className="justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                editSetDetailsForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitDisabled}>
              Save details
            </Button>
          </HStack>
        </VStack>
      </form>
      <DevTool control={editSetDetailsForm.control} />
    </FormProvider>
  );
};
