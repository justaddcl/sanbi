"use client";

import { type PropsWithChildren, useState } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";

import { Button } from "@components/ui/button";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { cn } from "@lib/utils";

type BaseCardProps = React.PropsWithChildren & {
  className?: string;
};

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
  buttonLabel?: React.ReactNode;
  buttonOnClick?: () => void;
  actionMenu?: React.ReactElement;
};

type CardProps = CardPropsWithHeader | CardPropsWithoutHeader;

export const Card: React.FC<CardProps> = ({
  header,
  title,
  badge,
  collapsible: isCollapsible,
  externalIsExpanded,
  initialIsExpanded,
  buttonLabel,
  buttonOnClick,
  actionMenu,
  className,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(
    initialIsExpanded ?? true,
  );

  const hasButton = !!buttonLabel && !!buttonOnClick;
  const shouldShowChildren =
    externalIsExpanded ?? (isCollapsible ? isExpanded : true);

  const HeaderWrapper: React.FC<PropsWithChildren> = ({ children }) =>
    isCollapsible ? (
      <Button
        size="sm"
        variant="ghost"
        className="flex h-full px-0 hover:bg-slate-50"
        onClick={(clickEvent) => {
          clickEvent.preventDefault();
          setIsExpanded((isExpanded) => !isExpanded);
        }}
      >
        {children}
      </Button>
    ) : (
      children
    );

  return (
    <VStack
      className={cn(
        "rounded-lg border p-1",
        { "lg:p-2": !isCollapsible },
        className,
      )}
    >
      <VStack as="header" className="gap-4">
        {header ? (
          header
        ) : (
          <HeaderWrapper>
            <HStack
              className={cn(
                "flex-wrap items-baseline justify-between gap-4 lg:gap-16 lg:pr-4",
                {
                  "w-full p-3": isCollapsible,
                },
              )}
            >
              <Text
                asElement="h3"
                style="header-medium-semibold"
                className="text-l flex-wrap md:text-xl"
              >
                {title}
              </Text>
              {!!badge && badge}
              {(!!isCollapsible || hasButton) && (
                <HStack className="flex items-start gap-2">
                  {isCollapsible && (isExpanded ? <CaretUp /> : <CaretDown />)}
                  {hasButton && (
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
                  )}
                  {!!actionMenu && actionMenu}
                </HStack>
              )}
            </HStack>
          </HeaderWrapper>
        )}
      </VStack>
      {shouldShowChildren && (
        <VStack>
          <hr className={cn("mt-1 bg-slate-100 lg:mt-2")} />
          <div className={cn("p-4")}>{children}</div>
        </VStack>
      )}
    </VStack>
  );
};
