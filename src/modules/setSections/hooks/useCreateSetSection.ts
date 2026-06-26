import { useCallback } from "react";
import { toast } from "sonner";

import { type RouterOutputs, trpc } from "@lib/trpc";

type ExistingSetSection = {
  sectionTypeId: string;
};

type SelectedSetSectionType = {
  id: string;
} | null;

type CreatedSetSection = NonNullable<
  RouterOutputs["setSection"]["create"][number]
>;

type CreateSetSectionParams = {
  setId: string;
  organizationId: string;
  sectionType: SelectedSetSectionType;
  existingSetSections: readonly ExistingSetSection[];
};

type CreateSetSectionResult =
  | { status: "created"; setSection: CreatedSetSection }
  | { status: "duplicate" | "invalid" | "error" };

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown error";

export const createSetSectionMessages = {
  loading: "Adding section to set...",
  emptySelection: "Please select a section type",
  duplicate: "Section type already exists on this set",
  success: "Section added to set",
  errorPrefix: "Could not add section to set",
} as const;

export const useCreateSetSection = () => {
  const createSetSectionMutation = trpc.setSection.create.useMutation();
  const apiUtils = trpc.useUtils();

  const createSetSection = useCallback(
    async ({
      setId,
      organizationId,
      sectionType,
      existingSetSections,
    }: CreateSetSectionParams): Promise<CreateSetSectionResult> => {
      const toastId = toast.loading(createSetSectionMessages.loading);

      if (!sectionType?.id) {
        toast.error(createSetSectionMessages.emptySelection, { id: toastId });
        return { status: "invalid" };
      }

      const setAlreadyHasSelectedSection = existingSetSections.some(
        (setSection) => setSection.sectionTypeId === sectionType.id,
      );

      if (setAlreadyHasSelectedSection) {
        toast.error(createSetSectionMessages.duplicate, { id: toastId });
        return { status: "duplicate" };
      }

      let newSetSection: CreatedSetSection;

      try {
        const [createdSetSection] = await createSetSectionMutation.mutateAsync({
          setId,
          organizationId,
          sectionTypeId: sectionType.id,
          position: existingSetSections.length,
        });

        if (!createdSetSection) {
          throw new Error("No section was created");
        }

        newSetSection = createdSetSection;
      } catch (error) {
        toast.error(
          `${createSetSectionMessages.errorPrefix}: ${getErrorMessage(error)}`,
          { id: toastId },
        );
        return { status: "error" };
      }

      toast.success(createSetSectionMessages.success, { id: toastId });

      try {
        await Promise.all([
          apiUtils.setSection.getSectionsForSet.refetch({
            organizationId,
            setId,
          }),
          apiUtils.set.get.invalidate({
            organizationId,
            setId,
          }),
        ]);
      } catch (error) {
        console.error("Failed to refresh set section data", error);
      }

      return { status: "created", setSection: newSetSection };
    },
    [apiUtils, createSetSectionMutation],
  );

  return {
    createSetSection,
    isPending: createSetSectionMutation.isPending,
  };
};
