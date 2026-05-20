import React, { useEffect, useMemo } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type * as z from "zod";

import { Button } from "@components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { VStack } from "@components/VStack";
import { orpc } from "@lib/orpc/client";
import { trpc } from "@lib/trpc";
import { type Resource } from "@lib/types";
import { insertResourceSchema } from "@lib/types/zod";
import { cn } from "@lib/utils";

const resourceFormSchema = insertResourceSchema.pick({
  title: true,
  url: true,
});

type ResourceFormFields = z.infer<typeof resourceFormSchema>;

type SharedResourceFormProps = {
  className?: string;
  layout?: "default" | "compact";
  onCancel?: () => void;
  renderPreview?: (values: ResourceFormFields) => React.ReactNode;
  onSuccess: () => void;
};

type CreateResourceFormProps = {
  mode: "create";
  songId: string;
  organizationId: string;
  resource?: never;
};

type UpdateResourceFormProps = {
  mode: "edit";
  resource: Resource;
  songId?: never;
  organizationId?: never;
};

type ResourceFormProps = (CreateResourceFormProps | UpdateResourceFormProps) &
  SharedResourceFormProps;

export const ResourceForm: React.FC<ResourceFormProps> = ({
  className,
  layout = "default",
  onCancel,
  renderPreview,
  onSuccess,
  ...props
}) => {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const resource = props.resource;
  const songId = resource?.songId ?? props.songId;
  const requestedOrganizationId =
    resource?.organizationId ?? props.organizationId;

  const createResourceMutation = useMutation(
    orpc.resource.create.mutationOptions(),
  );
  const updateResourceMutation = useMutation(
    orpc.resource.update.mutationOptions(),
  );

  const defaultValues = useMemo<ResourceFormFields>(
    () => ({
      title: resource?.title ?? "",
      url: resource?.url ?? "",
    }),
    [resource?.title, resource?.url],
  );

  const resourceForm = useForm<ResourceFormFields>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { clearErrors, reset, trigger } = resourceForm;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const watchedTitle = useWatch({
    control: resourceForm.control,
    name: "title",
  });
  const watchedUrl = useWatch({
    control: resourceForm.control,
    name: "url",
  });

  // TODO: handle if there is no user data (assume this will be handled before it reaches here though?)
  const { data: userData } = trpc.user.getUser.useQuery(
    {
      userId: userId!, // using non-null assertion since this query is only enabled if userId is not null
    },
    {
      enabled: !!userId,
    },
  );

  if (!userId) {
    return null;
  }

  const {
    formState: { errors, isSubmitting, submitCount },
  } = resourceForm;

  const handleResourceSubmit = async (formValues: ResourceFormFields) => {
    const actionErrorCopy = resource ? "update" : "link";
    const actionCopy = resource
      ? "Updating resource..."
      : "Linking resource...";
    const toastId = toast.loading(actionCopy);

    if (!userData) {
      Sentry.captureException(new Error("No user data available"));
      toast.error(`Could not ${actionErrorCopy} resource: invalid user`, {
        id: toastId,
      });

      return;
    }

    if (!songId || !requestedOrganizationId) {
      Sentry.captureException(new Error("No resource organization found"));
      toast.error(
        `Could not ${actionErrorCopy} resource: invalid team context`,
        {
          id: toastId,
        },
      );

      return;
    }

    const organizationMembership = userData.memberships.find(
      (membership) => membership.organizationId === requestedOrganizationId,
    );
    const organizationId = organizationMembership?.organizationId;

    if (!organizationId) {
      Sentry.captureException(new Error("No organization membership found"));
      toast.error(
        `Could not ${actionErrorCopy} resource: invalid team membership`,
        {
          id: toastId,
        },
      );

      return;
    }

    try {
      if (resource) {
        await updateResourceMutation.mutateAsync({
          resourceId: resource.id,
          organizationId,
          title: formValues.title,
          url: formValues.url,
        });
      } else {
        await createResourceMutation.mutateAsync({
          songId,
          organizationId,
          title: formValues.title,
          url: formValues.url,
        });
      }

      await queryClient.invalidateQueries({
        queryKey: orpc.resource.getBySongId.queryOptions({
          input: {
            songId,
            organizationId,
          },
        }).queryKey,
      });

      toast.success(resource ? "Resource was updated" : "Resource was linked", {
        id: toastId,
      });
      onSuccess();
      reset(resource ? formValues : defaultValues);
    } catch (error) {
      Sentry.captureException(error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      toast.error(`Could not ${actionErrorCopy} resource: ${errorMessage}`, {
        id: toastId,
      });
    }
  };

  const shouldSubmitButtonBeDisabled =
    isSubmitting || Object.keys(errors).length > 0;
  const submitText = resource ? "Save changes" : "Link resource";
  const isCompact = layout === "compact";

  return (
    <FormProvider {...resourceForm}>
      <form onSubmit={resourceForm.handleSubmit(handleResourceSubmit)}>
        <VStack className={cn("gap-6", isCompact && "gap-3", className)}>
          {renderPreview?.({
            title: watchedTitle ?? "",
            url: watchedUrl ?? "",
          })}
          <FormField
            control={resourceForm.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    size="medium"
                    onChange={(event) => {
                      field.onChange(event);

                      if (!errors.url && submitCount === 0) {
                        return;
                      }

                      if (event.target.value.trim() || submitCount > 0) {
                        void trigger("url");
                        return;
                      }

                      clearErrors("url");
                    }}
                    onBlur={(event) => {
                      field.onBlur();

                      if (event.target.value.trim() || submitCount > 0) {
                        void trigger("url");
                        return;
                      }

                      clearErrors("url");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={resourceForm.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input {...field} size="medium" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div
            className={cn(
              "mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
              isCompact && "mt-1",
            )}
          >
            {!!onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={shouldSubmitButtonBeDisabled}
            >
              {submitText}
            </Button>
          </div>
        </VStack>
      </form>
    </FormProvider>
  );
};
