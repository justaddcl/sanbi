import { zodResolver } from "@hookform/resolvers/zod";
import { type SetWithSectionsSongsAndEventType } from "@lib/types";
import { FormProvider, useForm } from "react-hook-form";
import { type CreateSetFormFields } from "@modules/sets/components/CreateSetForm";
import { insertSetSchema } from "@lib/types/zod";
import { SetDatePickerFormField } from "@modules/sets/components/forms/SetDatePickerFormField";
import { VStack } from "@components/VStack";
import { HStack } from "@components/HStack";
import { Button } from "@components/ui/button";
import { type Dispatch, type SetStateAction } from "react";
import { SetEventTypeSelectFormField } from "./SetEventTypeSelectFormField";
import { DevTool } from "@hookform/devtools";

const editSetDetailsFormSchema = insertSetSchema.pick({
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
  const editSetDetailsForm = useForm<EditSetDetailsFields>({
    resolver: zodResolver(editSetDetailsFormSchema),
    defaultValues: {
      date: set.date,
      eventTypeId: set.eventTypeId,
    },
  });

  const {
    formState: { isDirty, isValid },
  } = editSetDetailsForm;

  const isSubmitDisabled = !isDirty || !isValid;

  const handleEditSetDetails = () => {};

  return (
    <FormProvider {...editSetDetailsForm}>
      <form onSubmit={editSetDetailsForm.handleSubmit(handleEditSetDetails)}>
        <VStack className="gap-6">
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
