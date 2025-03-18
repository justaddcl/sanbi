import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { VStack } from "@components/VStack";
import { useState } from "react";

type SetNotesProps = {
  value: string | null;
};

export const SetNotes: React.FC<SetNotesProps> = ({ value }) => {
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>(value ?? "");

  const handleUpdateNotes = () => {
    // TODO: add set update action to save changes
    console.log("🚀 ~ SetNotes.tsx:15 ~ notes:", notes);
  };

  return (
    <VStack className={isEditingNotes ? "gap-4" : "gap-2"}>
      <Text style="header-small-semibold" className="text-slate-500">
        Set notes
      </Text>
      {isEditingNotes && (
        <VStack className="gap-4">
          <Textarea
            value={notes}
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
            <Text>{value}</Text>
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
