"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { insertOrganizationSchema } from "@/lib/types/zod";
import { api } from "@/trpc/react";

export type CreateTeamFormFields = z.infer<typeof insertOrganizationSchema>;

export const CreateTeamForm: React.FC = () => {
  const { isSignedIn, userId } = useAuth();

  const router = useRouter();
  if (!isSignedIn) {
    router.push("/sign-in");
  }

  const createTeamForm = useForm<CreateTeamFormFields>({
    resolver: zodResolver(insertOrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
    mode: "onBlur",
  });

  const createOrganizationMutation = api.organization.create.useMutation();
  const deleteOrganizationMutation = api.organization.delete.useMutation();

  const createOrganizationMembershipMutation =
    api.organizationMemberships.create.useMutation({
      onError(error, variables) {
        deleteOrganizationMutation.mutate({
          organizationId: variables.organizationId,
        });
      },
    });
  const {
    formState: { isDirty, isSubmitting, isValid },
    setError,
  } = createTeamForm;

  const shouldSubmitBeDisabled = !isDirty || !isValid || isSubmitting;

  const handleCreateOrganizationMembershipSubmit = async (
    formValues: CreateTeamFormFields,
  ) => {
    createOrganizationMutation.mutate(formValues, {
      onSuccess(data) {
        const [newOrganization] = data;

        createOrganizationMembershipMutation.mutate(
          {
            organizationId: newOrganization!.id,
            userId: userId!, // asserting userId can't be null since user would have been redirected to sign in if not already signed in
            permissionType: "owner",
          },
          {
            onSuccess(data) {
              const [newOrganizationMembership] = data;
              router.push(`/${newOrganizationMembership?.organizationId}`);
            },
          },
        );
      },
      onError(error) {
        // FIXME: migrating to zod 4 has apparently broken the form validation
        // console.log(
        //   "🚀 ~ createTeamForm.tsx:80 ~ handleCreateOrganizationMembershipSubmit ~ error:",
        //   JSON.stringify({ errorData: error.data }, null, 2),
        // );
        // if (error.data?.zodError?.fieldErrors) {
        //   const fieldErrors = error.data.zodError.fieldErrors as Partial<
        //     Record<keyof CreateTeamFormFields, string[]>
        //   >;
        //   const fieldNames = Object.keys(
        //     fieldErrors,
        //   ) as (keyof CreateTeamFormFields)[];
        //   if (fieldNames.length > 0) {
        //     const fieldName = fieldNames[0];
        //     const errorsForField = fieldErrors[fieldName];
        //     if (errorsForField && errorsForField.length > 0) {
        //       const [fieldError] = errorsForField;
        //       setError(fieldName, { type: "manual", message: fieldError });
        //     }
        //   }
        // }
      },
    });
  };

  return (
    <Form {...createTeamForm}>
      <form
        onSubmit={createTeamForm.handleSubmit((formValues) =>
          handleCreateOrganizationMembershipSubmit(formValues),
        )}
        className="m-auto flex max-w-md flex-col gap-4 rounded border border-slate-200 p-4 shadow"
      >
        <FormField
          control={createTeamForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team name *</FormLabel>
              <FormControl>
                <Input id="name" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={createTeamForm.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team URL *</FormLabel>
              <FormControl>
                {/* TODO: update onChange method to filter input for only URL-safe characters */}
                <Input id="slug" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          isLoading={isSubmitting}
          disabled={shouldSubmitBeDisabled}
          type="submit"
        >
          Create team
        </Button>
      </form>
    </Form>
  );
};
