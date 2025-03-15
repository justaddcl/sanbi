"use client";

import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { cn } from "@lib/utils";
import {
  Archive,
  ArrowDown,
  ArrowLineDown,
  ArrowLineUp,
  ArrowUp,
  Article,
  BoxArrowUp,
  Copy,
  DotsThree,
  Pencil,
  Plus,
  Swap,
  Trash,
} from "@phosphor-icons/react";
import React, {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

type ActionMenuProps = PropsWithChildren & {
  /** open/closed state of the menu */
  isOpen: boolean;

  /** callback to set open/closed state of the menu */
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const ActionMenu: React.FC<ActionMenuProps> = ({
  isOpen,
  setIsOpen,
  children,
}) => {
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="sm">
          <DotsThree className="text-slate-900" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent avoidCollisions align="end" side="bottom">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const iconMap = {
  Archive,
  ArrowDown,
  ArrowLineDown,
  ArrowLineUp,
  ArrowUp,
  Article,
  BoxArrowUp,
  Copy,
  Pencil,
  Plus,
  Swap,
  Trash,
} as const;

type ActionMenuItemProps = {
  label: string;
  icon: keyof typeof iconMap;
  destructive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export const ActionMenuItem: React.FC<ActionMenuItemProps> = ({
  label,
  icon,
  destructive = false,
  disabled = false,
  onClick,
}) => {
  const Icon = iconMap[icon];

  return (
    <DropdownMenuItem asChild disabled={disabled}>
      <HStack
        className="gap-2"
        aria-label={`${label} action`}
        onClick={onClick}
      >
        <Icon
          size={18}
          className={cn(
            "text-slate-700",
            [destructive && "text-red-500"],
            [disabled && "text-slate-400"],
          )}
        />
        <Text
          className={cn(
            "text-sm",
            [destructive && "text-red-500"],
            [disabled && "text-slate-400"],
          )}
        >
          {label}
        </Text>
      </HStack>
    </DropdownMenuItem>
  );
};
