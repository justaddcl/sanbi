"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@components/ResponsiveDialog";
import { ResourceForm } from "@modules/songs/forms/CreateResourceForm";
import { type Resource } from "@lib/types";

type EditResourceDialogProps = {
  resource: Resource | null;
  onClose: () => void;
};

export const EditResourceDialog: React.FC<EditResourceDialogProps> = ({
  resource,
  onClose,
}) => (
  <ResponsiveDialog
    open={!!resource}
    onOpenChange={(isOpen) => {
      if (!isOpen) {
        onClose();
      }
    }}
  >
    <ResponsiveDialogContent className="max-w-xl">
      {!!resource && (
        <>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Edit resource</ResponsiveDialogTitle>
            <VisuallyHidden.Root>
              <ResponsiveDialogDescription>
                Edit song resource details
              </ResponsiveDialogDescription>
            </VisuallyHidden.Root>
          </ResponsiveDialogHeader>
          <ResourceForm
            mode="edit"
            resource={resource}
            onCancel={onClose}
            onSuccess={onClose}
          />
        </>
      )}
    </ResponsiveDialogContent>
  </ResponsiveDialog>
);
