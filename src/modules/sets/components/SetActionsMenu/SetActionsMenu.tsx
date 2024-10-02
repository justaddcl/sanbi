"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Archive, DotsThree, Trash } from "@phosphor-icons/react/dist/ssr";
import { Text } from "@components/Text";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type SetActionsMenuProps = {
  setId: string;
  organizationId: string;
};

export const SetActionsMenu: React.FC<SetActionsMenuProps> = ({
  setId,
  organizationId,
}) => {
  const deleteSetMutation = api.set.delete.useMutation();
  const router = useRouter();

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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
          <DotsThree className="text-slate-900" size={12} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup asChild>
          <DropdownMenuItem className="gap-1">
            <Archive />
            <Text>Archive set</Text>
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
