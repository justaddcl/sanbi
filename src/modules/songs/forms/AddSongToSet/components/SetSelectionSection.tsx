import React from "react";

import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";

type SetSelectionSectionProps = React.ComponentPropsWithoutRef<"div"> &
  React.PropsWithChildren & {
    title: string;
    label?: React.ReactNode;
  };

export const SetSelectionSection: React.FC<SetSelectionSectionProps> = ({
  title,
  label,
  children,
  ...props
}) => {
  return (
    <VStack className="lg:gap-1 lg:px-6" {...props}>
      <HStack className="items-center justify-between px-4">
        <Text className="text-slate-500">{title}</Text>
        {label && typeof label === "string" ? (
          <Text className="text-sm">{label}</Text>
        ) : (
          label
        )}
      </HStack>
      <VStack className="pl-4 pr-1">{children}</VStack>
    </VStack>
  );
};
