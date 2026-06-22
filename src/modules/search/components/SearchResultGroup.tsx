import { type ReactNode } from "react";

import { CommandGroup } from "@components/ui/command";
import { HStack } from "@components/HStack";
import { cn } from "@lib/utils";

type SearchGroupHeadingProps = {
  icon: ReactNode;
  label: string;
};

export const SearchGroupHeading = ({
  icon,
  label,
}: SearchGroupHeadingProps) => (
  <HStack className="items-center gap-1.5">
    <span className="text-slate-400">{icon}</span>
    <span>{label}</span>
  </HStack>
);

type SearchResultGroupProps = {
  children: ReactNode;
  className?: string;
  heading?: ReactNode;
  value: string;
};

export const SearchResultGroup = ({
  children,
  className,
  heading,
  value,
}: SearchResultGroupProps) => (
  <CommandGroup
    className={cn("[&_[cmdk-group-heading]]:px-3", className)}
    heading={heading}
    value={value}
  >
    <div className="grid gap-0.5">{children}</div>
  </CommandGroup>
);
