"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import {
  Archive,
  BoxArrowUp,
  DotsThree,
  Trash,
} from "@phosphor-icons/react/dist/ssr";
import { Text } from "@components/Text";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type SetActionsMenuProps = {
  setId: string;
  organizationId: string;
  archived: boolean;
};

export const SetActionsMenu: React.FC<SetActionsMenuProps> = ({
  setId,
  organizationId,
  archived,
}) => {
  const router = useRouter();

  // TODO: move to mutations
  const deleteSetMutation = api.set.delete.useMutation();
  const deleteSet = (organizationId: string, setId: string) => {
    deleteSetMutation.mutate(
      { organizationId, setId },
      {
        onSuccess() {
          toast.success("Set deleted");
          router.push(`/${organizationId}`);
        },
        onError(error) {
          toast.error(`Set could not be deleted: ${error.message}`);
        },
      },
    );
  };

  // TODO: move to mutations
  const archiveSetMutation = api.set.archive.useMutation();
  const archiveSet = (organizationId: string, setId: string) => {
    archiveSetMutation.mutate(
      { organizationId, setId },
      {
        onSuccess() {
          toast.success("Set has been archived");
          router.refresh();
        },
        onError(error) {
          toast.error(`Set could not be archived: ${error.message}`);
        },
      },
    );
  };

  // TODO: move to mutations
  const unarchiveSetMutation = api.set.unarchive.useMutation();
  const unarchiveSet = (organizationId: string, setId: string) => {
    unarchiveSetMutation.mutate(
      { organizationId, setId },
      {
        onSuccess() {
          toast.success("Set has been unarchived");
          router.refresh();
        },
        onError(error) {
          toast.error(`Set could not be unarchived: ${error.message}`);
        },
      },
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
          <DotsThree className="text-slate-900" size={12} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup asChild>
          <DropdownMenuItem
            className="gap-1"
            onSelect={() =>
              archived
                ? unarchiveSet(organizationId, setId)
                : archiveSet(organizationId, setId)
            }
          >
            {archived ? <BoxArrowUp /> : <Archive />}
            <Text>{archived ? "Unarchive" : "Archive"} set</Text>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup asChild>
          <DropdownMenuItem
            className="gap-1 text-slate-400 hover:bg-red-100 hover:text-red-800 active:bg-red-200 active:text-red-900"
            onSelect={() => deleteSet(organizationId, setId)}
          >
            <Trash />
            <Text>Delete set</Text>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
