"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { useRouter } from "next/navigation";
import { createOrganizationAndAddUser } from "@/server/mutations";

export type CreateTeamFormFields = z.infer<typeof insertOrganizationSchema>;

export const CreateTeamForm: React.FC = () => {
  const createTeamForm = useForm<CreateTeamFormFields>({
    resolver: zodResolver(insertOrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
    mode: "onBlur",
  });

  const {
    formState: { isDirty, isSubmitting, isValid },
  } = createTeamForm;

  const shouldSubmitBeDisabled = !isDirty || !isValid || isSubmitting;

  const router = useRouter();

  const handleCreateOrganizationMembershipSubmit = async (
    formValues: CreateTeamFormFields,
  ) => {
    const result = await createOrganizationAndAddUser(formValues);

    if (!result?.data) {
      result?.errors.forEach((error) => {
        console.log("🚀 ~ error:", error);
        if (error.path) {
          createTeamForm.setError(error.path, {
            message: error.message,
          });
        }
      });
    }

    if (result?.data?.organization) {
      const redirectRoute = `/${result.data.organization?.id}`;
      router.push(redirectRoute);
    }
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
