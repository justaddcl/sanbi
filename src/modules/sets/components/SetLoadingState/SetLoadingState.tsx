import { type FC } from "react";
import { Text } from "@components/Text";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { HStack } from "@components/HStack";

// TODO: update this to skeleton?
export const SetPageLoadingState: FC = () => {
  return (
    <HStack className="items-center">
      <CircleNotch size={12} className="mr-2 h-4 w-4 animate-spin" />
      <Text>Getting set information...</Text>
    </HStack>
  );
};
