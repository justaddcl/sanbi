import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { toast } from "sonner";

import { trpc } from "@lib/trpc";

import {
  type ResourceFormFields,
  resourceFormSchema,
} from "./resourceFormSchema";
import type { ResourceFormControllerProps } from "./resourceFormTypes";
import { useResourceFormAutoTitle } from "./useResourceFormAutoTitle";
import { useResourceFormPreviewMetadata } from "./useResourceFormPreviewMetadata";

type UseResourceFormControllerProps = ResourceFormControllerProps & {
  onSuccess: () => void;
};

export const useResourceFormController = ({
  onSuccess,
  ...props
}: UseResourceFormControllerProps) => {
  const { userId } = useAuth();
  const apiUtils = trpc.useUtils();

  const resource = props.resource;
  const songId = resource?.songId ?? props.songId;
  const requestedOrganizationId =
    resource?.organizationId ?? props.organizationId;

  const createResourceMutation = trpc.resource.create.useMutation();
  const updateResourceMutation = trpc.resource.update.useMutation();
  const { data: userData } = trpc.user.getUser.useQuery(
    {
      userId: userId!,
    },
    {
      enabled: !!userId,
    },
  );

  const defaultValues = useMemo<ResourceFormFields>(
    () => ({
      title: resource?.title ?? "",
      url: resource?.url ?? "",
    }),
    [resource?.title, resource?.url],
  );

  const form = useForm<ResourceFormFields>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { reset } = form;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const watchedTitle = useWatch({
    control: form.control,
    name: "title",
  });
  const watchedUrl = useWatch({
    control: form.control,
    name: "url",
  });
  const preview = useResourceFormPreviewMetadata({
    organizationId: requestedOrganizationId,
    url: watchedUrl,
  });
  const autoTitle = useResourceFormAutoTitle({
    form,
    suggestedTitle: preview.suggestedTitle,
    debouncedUrl: preview.debouncedUrl,
    currentUrl: preview.trimmedUrl,
    watchedTitle,
  });
  const {
    formState: { errors, isDirty, isSubmitting },
  } = form;

  const handleSubmit = async (formValues: ResourceFormFields) => {
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

      await apiUtils.resource.getBySongId.invalidate({
        songId,
        organizationId,
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

  return {
    autoTitle,
    form,
    isAuthenticated: !!userId,
    preview,
    resource,
    submitButton: {
      isDisabled:
        isSubmitting ||
        preview.isLoading ||
        Object.keys(errors).length > 0 ||
        Boolean(resource && !isDirty),
      isLoading: isSubmitting,
      text: resource ? "Save changes" : "Link resource",
    },
    watchedTitle,
    watchedUrl,
    handleSubmit,
  };
};
