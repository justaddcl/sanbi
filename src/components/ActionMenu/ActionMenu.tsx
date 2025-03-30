"use client";

import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { Button, type buttonVariants } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  type DropdownMenuContentProps,
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
import { type VariantProps } from "class-variance-authority";
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

  /** The preferred alignment against the trigger. May change when collisions occur. */
  align?: DropdownMenuContentProps["align"];

  /** The preferred side of the trigger to render against when open. Will be reversed when collisions occur and avoidCollisions is enabled. */
  side?: DropdownMenuContentProps["side"];

  /** Which button variant should be used for the action menu trigger? */
  buttonVariant?: VariantProps<typeof buttonVariants>["variant"];
};

export const ActionMenu: React.FC<ActionMenuProps> = ({
  isOpen,
  setIsOpen,
  align = "end",
  side = "bottom",
  buttonVariant,
  children,
}) => {
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger>
        <Button variant={buttonVariant ?? "outline"} size="sm">
          <DotsThree className="text-slate-900" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent avoidCollisions align={align} side={side}>
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
