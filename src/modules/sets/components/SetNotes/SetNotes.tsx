import { api } from "@/trpc/react";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { VStack } from "@components/VStack";
import { sanitizeInput } from "@lib/string/sanitizeInput";
import { useState } from "react";
import { toast } from "sonner";
import unescape from "validator/es/lib/unescape";

type SetNotesProps = {
  setId: string;
  value: string | null;
  organizationId: string;
};

export const SetNotes: React.FC<SetNotesProps> = ({
  setId,
  value,
  organizationId,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>(value ?? "");

  const updateNotesMutation = api.set.updateNotes.useMutation();
  const apiUtils = api.useUtils();

  const handleUpdateNotes = () => {
    const toastId = toast.loading("Updating set notes...");

    updateNotesMutation.mutate(
      {
        setId,
        organizationId,
        notes: sanitizeInput(notes),
      },
      {
        async onSuccess() {
          toast.success("Set notes updated!", { id: toastId });

          await apiUtils.set.get.refetch();

          setIsEditingNotes(false);
        },

        onError(updateError) {
          toast.error(`Could not update set notes: ${updateError.message}`);
        },
      },
    );
  };

  return (
    <VStack className={isEditingNotes ? "gap-4" : "gap-2"}>
      <Text style="header-small-semibold" className="text-slate-500">
        Set notes
      </Text>
      {isEditingNotes && (
        <VStack className="gap-4">
          <Textarea
            value={unescape(notes)}
            onChange={(changeEvent) => {
              setNotes(changeEvent.target.value);
            }}
            className="px-2"
            autoFocus
          />
          <HStack className="justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsEditingNotes(false);
                setNotes(value ?? "");
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdateNotes}>
              Save notes
            </Button>
          </HStack>
        </VStack>
      )}
      {!isEditingNotes &&
        (value ? (
          <div onClick={() => setIsEditingNotes(true)}>
            <Text>{unescape(value)}</Text>
          </div>
        ) : (
          <div onClick={() => setIsEditingNotes(true)}>
            <Text style="body-small" className="text-slate-500">
              Add notes
            </Text>
          </div>
        ))}
    </VStack>
  );
};
