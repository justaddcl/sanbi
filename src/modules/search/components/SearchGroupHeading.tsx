import { type ReactNode } from "react";

import { HStack } from "@components/HStack";

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
