import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { useMutation } from "@tanstack/react-query";
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
import { insertResourceSchema } from "@lib/types/zod";
import { api as trpcApi } from "@/trpc/react";

const createResourceFormSchema = insertResourceSchema.pick({
  title: true,
  url: true,
});

type CreateResourceFormFields = z.infer<typeof createResourceFormSchema>;

type CreateResourceFormProps = {
  songId: string;
  onSuccess: () => void;
};

export const CreateResourceForm: React.FC<CreateResourceFormProps> = ({
  songId,
  onSuccess,
}) => {
  const { userId } = useAuth();

  const createResourceMutation = useMutation(
    orpc.resource.create.mutationOptions(),
  );

  const createResourceForm = useForm<CreateResourceFormFields>({
    resolver: zodResolver(createResourceFormSchema),
    defaultValues: {
      title: "",
      url: "",
    },
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  if (!userId) {
    return null;
  }

  // TODO: handle if there is no user data (assume this will be handled before it reaches here though?)
  const { data: userData } = trpcApi.user.getUser.useQuery({
    userId,
  });

  const {
    formState: { isSubmitting, isValid, isDirty },
  } = createResourceForm;

  const handleCreateResourceSubmit = async (
    formValues: CreateResourceFormFields,
  ) => {
    const toastId = toast.loading("Creating resource...");

    if (userData) {
      const organizationMembership = userData.memberships[0];

      if (!organizationMembership) {
        Sentry.captureException(new Error("No organization membership found"));
        toast.error("Could not create resource: invalid team membership");

        return;
      }

      await createResourceMutation.mutateAsync(
        {
          songId,
          organizationId: organizationMembership.organizationId,
          title: formValues.title,
          url: formValues.url,
        },
        {
          onSuccess() {
            toast.success("Resource was created", { id: toastId });
            onSuccess();
            createResourceForm.reset();
          },
          onError(error) {
            Sentry.captureException(error);

            toast.error(`Could not create resource: ${error.message}`, {
              id: toastId,
            });
          },
        },
      );
    }
  };

  const shouldSubmitButtonBeDisabled = !isDirty || !isValid || isSubmitting;

  return (
    <FormProvider {...createResourceForm}>
      <form
        onSubmit={createResourceForm.handleSubmit(handleCreateResourceSubmit)}
      >
        <VStack className="gap-6">
          <FormField
            control={createResourceForm.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} size="medium" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={createResourceForm.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input {...field} size="medium" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={shouldSubmitButtonBeDisabled}
            className="mt-4 md:self-end"
          >
            Create resource
          </Button>
        </VStack>
      </form>
    </FormProvider>
  );
};
