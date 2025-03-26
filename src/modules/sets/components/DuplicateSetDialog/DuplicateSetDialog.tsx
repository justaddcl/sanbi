import { HStack } from "@components/HStack";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@components/ResponsiveDialog";
import { Text } from "@components/Text";
import { Button } from "@components/ui/button";
import { VStack } from "@components/VStack";
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
    return (
      <ResponsiveDialog open={isOpen} onOpenChange={setIsOpen}>
        <ResponsiveDialogContent className="mx-6 max-h-[90%] gap-2 lg:max-h-[80%] lg:gap-6">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Duplicate set</ResponsiveDialogTitle>
            <VisuallyHidden.Root>
              <ResponsiveDialogDescription>
                Duplicate set
              </ResponsiveDialogDescription>
            </VisuallyHidden.Root>
          </ResponsiveDialogHeader>
          <VStack className="gap-8">
            <Text>Unable to load user data. Please try again later.</Text>
            <HStack className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Close
              </Button>
            </HStack>
          </VStack>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    );
  }

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={setIsOpen}>
      <ResponsiveDialogContent className="mx-6 max-h-[90%] gap-2 lg:max-h-[80%] lg:gap-6">
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
