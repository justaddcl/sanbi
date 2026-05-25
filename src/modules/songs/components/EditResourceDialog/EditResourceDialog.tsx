"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@components/ResponsiveDialog";
import { Text } from "@components/Text";
import { ResourceForm } from "@modules/songs/forms/CreateResourceForm";
import { getDisplayUrl } from "@modules/songs/utils/getDisplayUrl";
import { type Resource } from "@lib/types";

import { ResourceCardImage } from "../ResourceCardImage";

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
            renderPreview={(values) => {
              const previewResource = {
                ...resource,
                title: values.title.trim() || resource.title,
                url: values.url.trim() || resource.url,
              };

              return (
                <div className="grid grid-cols-[48px_1fr] items-center gap-3 rounded-md border bg-slate-50 p-3">
                  <ResourceCardImage resource={previewResource} />
                  <div className="min-w-0">
                    <Text className="truncate text-sm font-semibold text-slate-900">
                      {previewResource.title}
                    </Text>
                    <Text className="truncate text-xs text-slate-400">
                      {getDisplayUrl(previewResource.url)}
                    </Text>
                  </div>
                </div>
              );
            }}
            onSuccess={onClose}
          />
        </>
      )}
    </ResponsiveDialogContent>
  </ResponsiveDialog>
);
