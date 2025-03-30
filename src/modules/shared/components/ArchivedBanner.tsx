import { HStack } from "@components/HStack";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { Button } from "@components/ui/button";
import { VStack } from "@components/VStack";
import { Archive, CaretDown } from "@phosphor-icons/react";
import { CaretUp } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Text } from "@components/Text";

// This is needed since setting text-amber-900 on the icons doesn't seem to work
const AMBER_900 = "#78350f";

type ArchivedBannerProps = {
  itemType: "set" | "song";
  onCtaClick?: () => void;
};

export const ArchivedBanner: React.FC<ArchivedBannerProps> = ({
  itemType,
  onCtaClick,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <Alert className="border-amber-200 bg-amber-50 ">
      <HStack className="items-start gap-2">
        <div className="grid h-9 w-6 shrink-0 place-items-center">
          <Archive color={AMBER_900} />
        </div>
        <VStack className="w-full">
          <HStack className="items-center justify-between">
            <AlertTitle className="mb-0 text-amber-900">
              <span className="capitalize">{itemType}</span> is archived
            </AlertTitle>
            <Button
              size="sm"
              variant="ghost"
              className="hover:bg-amber-100"
              onClick={() => {
                setIsExpanded((isExpanded) => !isExpanded);
              }}
            >
              {isExpanded ? (
                <CaretUp color={AMBER_900} />
              ) : (
                <CaretDown color={AMBER_900} />
              )}
            </Button>
          </HStack>
          {isExpanded && (
            <AlertDescription>
              <VStack className="justify-start gap-3">
                <VStack className="gap-1">
                  <Text className="text-amber-700">
                    This means this {itemType} won&apos;t show up in your
                    library or in your searches by default. However, all set
                    history and data are preserved and you can find it in the
                    archived section.
                  </Text>
                </VStack>
                <Button
                  variant="link"
                  size="sm"
                  className="self-start p-0 text-amber-900"
                  onClick={onCtaClick}
                >
                  Unarchive this {itemType}
                </Button>
              </VStack>
            </AlertDescription>
          )}
        </VStack>
      </HStack>
    </Alert>
  );
};
