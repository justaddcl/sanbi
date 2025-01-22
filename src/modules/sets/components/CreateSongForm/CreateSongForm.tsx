import { Input } from "@components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSongSchema } from "@lib/types/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { songKeys } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { formatSongKey } from "@/lib/string/formatSongKey";

const createSongFormSchema = insertSongSchema
  .pick({
    name: true,
    preferredKey: true,
  })
  .extend({
    /**
     * by default, zod thinks preferred key and notes are nullable which causes type issues.
     * these fields have been manually re-defined to omit the nullable
     */
    preferredKey: z.enum(songKeys).optional(), // TODO: confirm if this should be optional
    notes: z.string().optional(),
  });

type CreateSongFormFields = z.infer<typeof createSongFormSchema>;

type CreateSongFormProps = {
  onSubmit: () => void;
};

export const CreateSongForm: React.FC<CreateSongFormProps> = ({ onSubmit }) => {
  const router = useRouter();
  const { userId } = useAuth();

  const createSongForm = useForm<CreateSongFormFields>({
    resolver: zodResolver(createSongFormSchema),
    defaultValues: {
      name: "",
      preferredKey: undefined,
      notes: "",
    },
    mode: "onChange",
  });

  const createSongMutation = api.song.create.useMutation();

  if (!userId) {
    return null;
  }

  const { data: userData, isError: isGetUserQueryError } =
    api.user.getUser.useQuery({
      userId,
    });

  const handleCreateSongSubmit = async (formValues: CreateSongFormFields) => {
    console.log("🚀 ~ handleCreateSongSubmit ~ formValues:", formValues);
    const { name, preferredKey, notes } = formValues;

    // attempt to create song
    if (!isGetUserQueryError && userData) {
      const organizationMembership = userData.memberships[0];
      if (!organizationMembership) {
        return;
      }

      await createSongMutation.mutateAsync(
        {
          name,
          preferredKey,
          notes,
          organizationId: organizationMembership.organizationId,
          createdBy: userData.id,
          isArchived: false,
        },
        {
          onSuccess(data) {
            console.log("🤖 [createSongMutation/onSuccess] ~ data:", data);
            const [newSong] = data;

            toast.success("Song was created");
            router.push(
              `/${organizationMembership.organizationId}/songs/${newSong?.id}`,
            );
          },
          onError(error) {
            console.log("🤖 [createSongMutation/onError] ~ error:", error);
            toast.error(`Could not create song: ${error.message}`);
          },
        },
      );
    }

    // close the dialog
    onSubmit?.();
  };

  const {
    formState: { isDirty, isSubmitting, isValid },
  } = createSongForm;

  const shouldSubmitBeDisabled = !isDirty || !isValid || isSubmitting;

  return (
    <Form {...createSongForm}>
      <form
        onSubmit={createSongForm.handleSubmit(handleCreateSongSubmit)}
        className="mx-6 flex flex-col gap-8 pb-8 min-[1025px]:mx-0"
      >
        <FormField
          control={createSongForm.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel>Song name *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={createSongForm.control}
          name="preferredKey"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel>Preferred key *</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred key..." />
                  </SelectTrigger>
                  <SelectContent>
                    {songKeys.map((key) => (
                      <SelectItem key={key} value={key}>
                        {formatSongKey(key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={createSongForm.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel>Song notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Add notes about the song" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          className="w-full"
          type="submit"
          isLoading={isSubmitting}
          disabled={shouldSubmitBeDisabled}
        >
          Create song
        </Button>
      </form>
    </Form>
  );
};
