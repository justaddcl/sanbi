import { useState } from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import { Button } from "@components/ui/button";
import { type ComboboxOption } from "@components/ui/combobox";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@components/ResponsiveDialog";
import { VStack } from "@components/VStack";
import { SetSectionTypeCombobox } from "@modules/sets/components/SetSectionTypeCombobox";
import { useCreateSetSection } from "@modules/setSections/hooks";
import { type SetSectionWithSongs } from "@lib/types";
import { cn } from "@lib/utils";
import { useResponsive } from "@/hooks/useResponsive";

type SetSectionCreationDialogProps = {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  setId: string;
  organizationId: string;
  existingSetSections: SetSectionWithSongs[];
};

export const SetSectionCreationDialog: React.FC<
  SetSectionCreationDialogProps
> = ({
  open,
  onOpenChange,
  setId,
  organizationId,
  existingSetSections,
}) => {
  const { textSize } = useResponsive();
  const [newSetSectionType, setNewSetSectionType] =
    useState<ComboboxOption | null>(null);
  const { createSetSection, isPending } = useCreateSetSection();

  const closeDialog = () => {
    setNewSetSectionType(null);
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setNewSetSectionType(null);
    }
    onOpenChange(isOpen);
  };

  const handleAddSetSection = async () => {
    const result = await createSetSection({
      setId,
      organizationId,
      sectionType: newSetSectionType,
      existingSetSections,
    });

    if (result.status === "created") {
      closeDialog();
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={handleOpenChange}
      drawerProps={{ repositionInputs: true }}
    >
      <ResponsiveDialogContent className="p-6 lg:p-8">
        <ResponsiveDialogHeader>
          <ResponsiveDialogDescription asChild>
            <VisuallyHidden.Root>Dialog to add section to set</VisuallyHidden.Root>
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogTitle
          dialogProps={{ className: "flex-wrap text-xl" }}
          drawerProps={{ className: "flex-wrap text-xl" }}
        >
          Add section to set
        </ResponsiveDialogTitle>
        <VStack className="mt-4 gap-4 lg:mt-0 lg:gap-8">
          <SetSectionTypeCombobox
            placeholder="Select a section type to add"
            value={newSetSectionType}
            onChange={setNewSetSectionType}
            textStyles={cn("text-slate-700", textSize)}
            organizationId={organizationId}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(textSize)}
              onClick={closeDialog}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddSetSection}
              disabled={!newSetSectionType?.id || isPending}
              isLoading={isPending}
              className={cn(textSize)}
            >
              Add section to set
            </Button>
          </div>
        </VStack>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
