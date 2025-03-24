import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@components/ResponsiveDialog";
import { DuplicateSetForm } from "@modules/sets/components/forms/DuplicateSetForm";
import { useUserQuery } from "@modules/users/api/queries";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { type Dispatch, type SetStateAction } from "react";
import { type SetActionsMenuProps } from "../SetActionsMenu";

type DuplicateSetDialogProps = {
  setId: SetActionsMenuProps["setId"];
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const DuplicateSetDialog: React.FC<DuplicateSetDialogProps> = ({
  setId,
  isOpen,
  setIsOpen,
}) => {
  const {
    data: userData,
    error: userQueryError,
    isLoading: userQueryLoading,
    isAuthLoaded,
  } = useUserQuery();
  const userMembership = userData?.memberships[0];

  if (!isAuthLoaded || !!userQueryError || !userData || !userMembership) {
    return null;
  }

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={setIsOpen}>
      <ResponsiveDialogContent className="mx-6 gap-2 p-6 lg:gap-6 lg:p-8">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Duplicate set</ResponsiveDialogTitle>
          <VisuallyHidden.Root>
            <ResponsiveDialogDescription>
              Duplicate set
            </ResponsiveDialogDescription>
          </VisuallyHidden.Root>
        </ResponsiveDialogHeader>
        <DuplicateSetForm
          setToDuplicateId={setId}
          setIsDuplicateSetDialogOpen={setIsOpen}
        />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
