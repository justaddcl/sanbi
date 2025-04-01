import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { Button } from "@components/ui/button";
import { VStack } from "@components/VStack";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { useState } from "react";

type BaseCardProps = React.PropsWithChildren;

type CardPropsWithHeader = BaseCardProps & {
  header: React.ReactElement;
  title?: never;
  badge?: never;
  collapsible?: never;
  externalIsExpanded?: boolean;
  initialIsExpanded?: never;
  buttonLabel?: never;
  buttonOnClick?: never;
  actionMenu?: never;
};

type CardPropsWithoutHeader = BaseCardProps & {
  header?: never;
  title: string;
  badge?: React.ReactElement;
  collapsible?: boolean;
  externalIsExpanded?: never;
  initialIsExpanded?: boolean;
  buttonLabel?: React.ReactElement;
  buttonOnClick?: () => void;
  actionMenu?: React.ReactElement;
};

type CardProps = CardPropsWithHeader | CardPropsWithoutHeader;

export const Card: React.FC<CardProps> = ({
  header,
  title,
  badge,
  collapsible,
  externalIsExpanded,
  initialIsExpanded,
  buttonLabel,
  buttonOnClick,
  actionMenu,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(
    initialIsExpanded ?? true,
  );

  return (
    <VStack className="gap-4 rounded-lg border p-4 md:gap-4 lg:p-6">
      <VStack as="header" className="gap-4">
        {!!header ? (
          header
        ) : (
          <>
            <HStack className="flex-wrap items-baseline justify-between gap-4 lg:gap-16 lg:pr-4">
              <Text
                asElement="h3"
                style="header-medium-semibold"
                className="text-l flex-wrap md:text-xl"
              >
                {title}
              </Text>
              {!!badge && badge}
            </HStack>
            <HStack className="flex items-start gap-2">
              {collapsible && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(clickEvent) => {
                    clickEvent.preventDefault();
                    setIsExpanded((isExpanded) => !isExpanded);
                  }}
                >
                  {isExpanded ? <CaretUp /> : <CaretDown />}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={(clickEvent) => {
                  clickEvent.preventDefault();
                  buttonOnClick?.();
                }}
              >
                {buttonLabel}
              </Button>
              {!!actionMenu && actionMenu}
            </HStack>
          </>
        )}
      </VStack>
      {((collapsible && isExpanded) ?? externalIsExpanded) && (
        <VStack>
          <hr className="mb-4 bg-slate-100" />
          {children}
        </VStack>
      )}
    </VStack>
  );
};
