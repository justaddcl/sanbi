import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type SongSearchDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SongSearchDialog: React.FC<SongSearchDialogProps> = ({
  open,
  setOpen,
}) => {
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search for a song or tag..." />
      <CommandList>
        <CommandEmpty>No songs found.</CommandEmpty>
        <CommandGroup heading="Songs">
          <CommandItem>Test song</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
