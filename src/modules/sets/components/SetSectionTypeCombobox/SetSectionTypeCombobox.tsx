import { useState } from "react";
import {
  Combobox,
  type ComboboxProps,
  type ComboboxOption,
} from "@components/ui/combobox";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { CommandGroup } from "@components/ui/command";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export type SetSectionTypeComboboxProps = {
  /** Available set section type options */
  options: ComboboxOption[];

  /** Currently selected value */
  value: ComboboxOption | null;

  /** Callback when value changes */
  onChange: (value: ComboboxOption | null) => void;

  /** Whether the combobox is open */
  open: boolean;

  /** Callback to set open state */
  setOpen: React.Dispatch<React.SetStateAction<ComboboxProps["open"]>>;

  /** Whether the combobox is loading */
  loading?: boolean;

  /** Whether the combobox is disabled */
  disabled?: boolean;

  /** Organization ID for creating new section types */
  organizationId: string;

  /** Optional text styles to apply to the combobox */
  textStyles?: string;

  /** Placeholder text */
  placeholder?: string;

  /** Optional callback after a new section type is created */
  onCreateSuccess?: (newSectionType: { id: string; name: string }) => void;
};

export const SetSectionTypeCombobox: React.FC<SetSectionTypeComboboxProps> = ({
  options,
  value,
  onChange,
  open,
  setOpen,
  loading = false,
  disabled = false,
  organizationId,
  textStyles = "text-slate-700",
  placeholder = "Add a set section",
  onCreateSuccess,
}) => {
  const [newSetSectionInputValue, setNewSetSectionInputValue] =
    useState<string>("");

  const createSetSectionTypeMutation = api.setSectionType.create.useMutation();
  const apiUtils = api.useUtils();

  const handleCreateNewSetSectionType = async () => {
    const trimmedInput = newSetSectionInputValue.trim();

    if (!trimmedInput) return;

    await createSetSectionTypeMutation.mutateAsync(
      { name: trimmedInput, organizationId },
      {
        async onSuccess(createSetSectionTypeMutationResult) {
          const [newSetSectionType] = createSetSectionTypeMutationResult;

          if (newSetSectionType) {
            toast.success(`${newSetSectionType.name} set section type created`);

            // If a callback was provided, call it with the new section type
            if (onCreateSuccess) {
              onCreateSuccess(newSetSectionType);
            }

            // Update the selected value
            onChange({
              id: newSetSectionType.id,
              label: newSetSectionType.name,
            });

            await apiUtils.setSectionType.getTypes.invalidate({
              organizationId,
            });
          }
        },
      },
    );

    setOpen(false);
    setNewSetSectionInputValue("");
  };

  return (
    <Combobox
      placeholder={placeholder}
      options={options}
      value={value}
      onChange={onChange}
      open={open}
      setOpen={setOpen}
      loading={loading}
      disabled={disabled}
      textStyles={cn(textStyles)}
    >
      <CommandGroup heading="Create new section type">
        <div
          className={cn(
            "flex gap-2",
            "relative cursor-default select-none items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          )}
        >
          <Input
            size="small"
            className="flex-1"
            value={newSetSectionInputValue}
            onChange={(changeEvent) =>
              setNewSetSectionInputValue(changeEvent.target.value)
            }
            onKeyDown={async (e) => {
              if (
                e.key === "Enter" &&
                newSetSectionInputValue.trim() !== "" &&
                !createSetSectionTypeMutation.isPending
              ) {
                e.preventDefault();
                await handleCreateNewSetSectionType();
              }
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            className="flex-grow-0"
            onClick={handleCreateNewSetSectionType}
            isLoading={createSetSectionTypeMutation.isPending}
            disabled={
              newSetSectionInputValue === "" ||
              createSetSectionTypeMutation.isPending
            }
          >
            <Plus />
            Create
          </Button>
        </div>
      </CommandGroup>
    </Combobox>
  );
};
