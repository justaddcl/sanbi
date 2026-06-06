import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";
import { Textarea } from "./textarea";

type ResourceFields = {
  title: string;
  notes: string;
};

const FormExample: React.FC<{ withError?: boolean }> = ({
  withError = false,
}) => {
  const form = useForm<ResourceFields>({
    defaultValues: {
      title: withError ? "" : "Sunday service arrangement",
      notes: "Capo 2. Repeat the bridge after the second chorus.",
    },
  });

  useEffect(() => {
    if (!withError) {
      return;
    }

    form.setError("title", {
      type: "manual",
      message: "Title is required",
    });
  }, [form, withError]);

  return (
    <Form {...form}>
      <form
        className="grid max-w-lg gap-5"
        onSubmit={(event) => event.preventDefault()}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resource title</FormLabel>
              <FormControl>
                <Input placeholder="Add a display title" {...field} />
              </FormControl>
              <FormDescription>
                This label appears on resource cards.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Arrangement notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Add notes for the team" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

const meta = {
  title: "Base Components/Form",
  component: FormItem,
} satisfies Meta<typeof FormItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Wrapper: Story = {
  render: () => <FormExample />,
};

export const ErrorState: Story = {
  render: () => <FormExample withError />,
};
