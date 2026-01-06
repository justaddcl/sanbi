import { type Dispatch, type SetStateAction, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretDown, CaretUp } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";

import { Button } from "@components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@components/ui/collapsible";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { TextareaFormField } from "@components/TextareaFormField";
import { VStack } from "@components/VStack";
import { useSetQuery } from "@modules/sets/api";
import { type CreateSetFormFields } from "@modules/sets/components/CreateSetForm";
import { SetDatePickerFormField } from "@modules/sets/components/forms/SetDatePickerFormField";
import { useUserQuery } from "@modules/users/api/queries";
import { sanitizeInput } from "@lib/string";
import { type SetSectionWithSongs } from "@lib/types";
import { insertSetSchema } from "@lib/types/zod";
import { useResponsive } from "@/hooks/useResponsive";
import { api } from "@/trpc/react";

import { SetEventTypeSelectFormField } from "./SetEventTypeSelectFormField";
import { SetSectionList } from "../SetSectionList/SetSectionList";

const duplicateSetFormSchema = insertSetSchema.pick({
  date: true,
  eventTypeId: true,
  notes: true,
});

export type DuplicateSetFields = CreateSetFormFields;

export type DuplicateSetFormProps = {
  setToDuplicateId: string;
  setIsDuplicateSetDialogOpen: Dispatch<SetStateAction<boolean>>;
};

export const DuplicateSetForm: React.FC<DuplicateSetFormProps> = ({
  setToDuplicateId,
  setIsDuplicateSetDialogOpen,
}) => {
  const { isDesktop } = useResponsive();
  const [isSectionsAndSongsOpen, setIsSectionsAndSongsOpen] =
    useState<boolean>(isDesktop);

  const router = useRouter();

  const duplicateSetMutation = api.set.duplicate.useMutation();

  const {
    data: userData,
    error: userQueryError,
    isLoading: userQueryLoading,
    isAuthLoaded,
  } = useUserQuery();
  const userMembership = userData?.memberships[0];

  const {
    data: setData,
    isLoading: setQueryLoading,
    error: setQueryError,
  } = useSetQuery({
    setId: setToDuplicateId,
    organizationId: userMembership?.organizationId ?? "",
    userId: userData?.id ?? "", // we use a non-null assertion here since the redirect would have already fired if userId is falsy
  });

  const editSetDetailsForm = useForm({
    resolver: zodResolver(duplicateSetFormSchema),
    defaultValues: {
      date: undefined,
      eventTypeId: undefined,
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

  const isLoading = duplicateSetMutation.isPending;
  const isSubmitDisabled =
    !isDirty || !isValid || userQueryLoading || !isAuthLoaded || isLoading;

  const handleDuplicateSet = (formValues: DuplicateSetFields) => {
    const { date, eventTypeId, notes } = formValues;
    const toastId = toast.loading("Duplicating set...");

    duplicateSetMutation.mutate(
      {
        setToDuplicateId,
        date,
        eventTypeId,
        notes: notes ? sanitizeInput(notes) : null,
        organizationId: userMembership.organizationId,
      },
      {
        async onSuccess({ newSet }) {
          toast.success("Set duplicated!", { id: toastId });

          router.push(`/${userMembership.organizationId}/sets/${newSet.id}`);
        },
        onError(duplicateError) {
          toast.error(`Could not duplicate set: ${duplicateError.message}`, {
            id: toastId,
          });
        },
      },
    );
  };

  return (
    <FormProvider {...editSetDetailsForm}>
      <form onSubmit={editSetDetailsForm.handleSubmit(handleDuplicateSet)}>
        <VStack className="gap-6">
          <SetDatePickerFormField />
          <SetEventTypeSelectFormField />
          <TextareaFormField name="notes" label="Set notes" />
          {setData && setData.sections.length > 0 && (
            <Collapsible
              open={isSectionsAndSongsOpen}
              onOpenChange={setIsSectionsAndSongsOpen}
            >
              <CollapsibleTrigger>
                <HStack className="gap-4">
                  <Text className="text-sm font-medium leading-none">
                    Songs
                  </Text>
                  {isSectionsAndSongsOpen ? <CaretUp /> : <CaretDown />}
                </HStack>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {setQueryLoading && <Text>Loading...</Text>}
                {!setQueryLoading && setData && (
                  <VStack className="mt-2 gap-6 lg:gap-8">
                    {setData.sections.map((section) => {
                      let sectionStartIndex = 1;
                      for (
                        let sectionPosition = 0;
                        sectionPosition < section.position;
                        sectionPosition++
                      ) {
                        sectionStartIndex +=
                          setData.sections[sectionPosition]!.songs.length;
                      }
                      return (
                        <SetSectionList
                          key={section.id}
                          section={section as SetSectionWithSongs}
                          sectionStartIndex={sectionStartIndex}
                        />
                      );
                    })}
                  </VStack>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
          <HStack className="justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsDuplicateSetDialogOpen(false);
                editSetDetailsForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitDisabled}
              isLoading={isLoading}
            >
              Duplicate set
            </Button>
          </HStack>
        </VStack>
      </form>
    </FormProvider>
  );
};
