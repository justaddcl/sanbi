import React from "react";

import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";

type SetSelectionSectionProps = React.PropsWithChildren & {
  title: string;
  label?: string;
};

export const SetSelectionSection: React.FC<SetSelectionSectionProps> = ({
  title,
  label,
  children,
}) => {
  return (
    <VStack className="lg:gap-1 lg:px-6">
      <HStack className="justify-between px-4">
        <Text className="text-slate-500">{title}</Text>
        {label && <Text className="text-sm">{label}</Text>}
      </HStack>
      <VStack className="pl-4 pr-1">{children}</VStack>
    </VStack>
  );
};
