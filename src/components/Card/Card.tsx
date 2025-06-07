"use client";

import { useState } from "react";
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
  headerClassName?: never;
  title?: never;
  badge?: never;
  badgeAlignStart?: never;
  badgeAlignEnd?: never;
  hideBadgeWhenExpanded?: never;
  hideBadgeWhenCollapsed?: never;
  collapsible?: never;
  externalIsExpanded?: boolean;
  initialIsExpanded?: never;
  buttonLabel?: never;
  buttonOnClick?: never;
  actionMenu?: never;
};

type CardPropsWithoutHeader = BaseCardProps & {
  header?: never;
  headerClassName?: string;
  title: string;
  badge?: React.ReactElement;
  badgeAlignStart?: boolean;
  badgeAlignEnd?: boolean;
  hideBadgeWhenExpanded?: boolean;
  hideBadgeWhenCollapsed?: boolean;
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
  headerClassName,
  title,
  badge,
  badgeAlignStart = true,
  badgeAlignEnd,
  hideBadgeWhenExpanded,
  hideBadgeWhenCollapsed,
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
  const shouldShowBadge =
    !!badge &&
    ((isExpanded && !hideBadgeWhenExpanded) ||
      (!isExpanded && !hideBadgeWhenCollapsed));

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
          <HStack
            className={cn(
              "flex-wrap items-center gap-2 md:gap-4 lg:pr-4",
              {
                "w-full p-3": isCollapsible,
              },
              headerClassName,
            )}
          >
            <Button
              size="sm"
              variant="ghost"
              className="flex h-full flex-1 px-0 hover:bg-slate-50"
              onClick={(clickEvent) => {
                clickEvent.preventDefault();
                setIsExpanded((isExpanded) => !isExpanded);
              }}
            >
              <HStack
                className={cn("flex-1 items-center gap-4", {
                  "justify-start": badgeAlignStart,
                  "justify-between": badgeAlignEnd,
                })}
              >
                <Text
                  asElement="h3"
                  style="header-medium-semibold"
                  className="font-medium md:text-lg md:text-slate-700 lg:font-semibold"
                >
                  {title}
                </Text>
                {shouldShowBadge && badge}
              </HStack>
            </Button>
            {(!!isCollapsible || hasButton) && (
              <HStack className="flex items-start gap-1 md:gap-2">
                {isCollapsible && (
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
        )}
      </VStack>
      {shouldShowChildren && (
        <VStack className="mt-1 md:mt-2">
          <hr className={cn("bg-slate-100")} />
          <div className={cn("p-3")}>{children}</div>
        </VStack>
      )}
    </VStack>
  );
};
