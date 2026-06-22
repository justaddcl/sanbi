import { type ReactNode } from "react";

import { CommandGroup } from "@components/ui/command";
import { cn } from "@lib/utils";

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
