"use client";

import { deleteSet } from "@server/mutations";
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

type SetActionsMenuProps = {
  setId: string;
  organizationId: string;
};

// FIXME: should use the delete Mutation hook instead of the server action
export const SetActionsMenu: React.FC<SetActionsMenuProps> = ({
  setId,
  organizationId,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
          <DotsThree className="text-slate-900" size={12} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-1">
            <Archive />
            <Text>Archive set</Text>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="gap-1"
            onSelect={() => deleteSet(setId, organizationId)}
          >
            <Trash color="slate-300" />
            <Text color="slate-400">Delete set</Text>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
