"use client";

import React, { useState } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";

import { Button } from "@components/ui/button";
import { CardTitleSection } from "@components/Card/CardTitleSection";
import { HStack } from "@components/HStack";
import { VStack } from "@components/VStack";
import { cn } from "@lib/utils";

type BaseCardProps = React.PropsWithChildren & {
  className?: string;
  childrenClassName?: string;
};

type CardPropsWithHeader = BaseCardProps & {
  header: React.ReactElement;
  headerClassName?: never;
  title?: never;
  titleClassName?: never;
  badge?: never;
  badgeAlignStart?: never;
  badgeAlignEnd?: never;
  hideBadgeWhenExpanded?: never;
  hideBadgeWhenCollapsed?: never;
  collapsible?: never;
  externalIsExpanded?: boolean;
  initialIsExpanded?: never;
  button?: never;
  actionMenu?: never;
};

type CardPropsWithoutHeader = BaseCardProps & {
  header?: never;
  headerClassName?: string;
  title: string;
  titleClassName?: string;
  badge?: React.ReactElement;
  badgeAlignStart?: boolean;
  badgeAlignEnd?: boolean;
  hideBadgeWhenExpanded?: boolean;
  hideBadgeWhenCollapsed?: boolean;
  collapsible?: boolean;
  externalIsExpanded?: never;
  initialIsExpanded?: boolean;
  button?: React.ReactElement;
  actionMenu?: React.ReactElement;
};

type CardProps = CardPropsWithHeader | CardPropsWithoutHeader;

export const Card: React.FC<CardProps> = ({
  header,
  headerClassName,
  title,
  titleClassName,
  badge,
  badgeAlignStart = true,
  badgeAlignEnd,
  hideBadgeWhenExpanded,
  hideBadgeWhenCollapsed,
  collapsible: isCollapsible,
  externalIsExpanded,
  initialIsExpanded,
  button,
  actionMenu,
  className,
  children,
  childrenClassName,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(
    initialIsExpanded ?? true,
  );

  const shouldShowChildren =
    externalIsExpanded ?? (isCollapsible ? isExpanded : true);

  const shouldShowBadge = React.useMemo(() => {
    if (!badge) {
      return false;
    }

    if (isExpanded) {
      return !hideBadgeWhenExpanded;
    }

    return !hideBadgeWhenCollapsed;
  }, [badge, isExpanded, hideBadgeWhenExpanded, hideBadgeWhenCollapsed]);

  const handleToggleExpansion = (clickEvent: React.MouseEvent) => {
    clickEvent.preventDefault();
    setIsExpanded((isExpanded) => !isExpanded);
  };

  return (
    <VStack className={cn("rounded-lg border p-1 lg:p-2", className)}>
      <VStack as="header" className="gap-4">
        {header ? (
          header
        ) : (
          <HStack
            className={cn(
              "flex-wrap items-center gap-2",
              {
                "w-full": isCollapsible,
              },
              headerClassName,
            )}
          >
            <Button
              size="sm"
              variant="ghost"
              className={cn("flex h-full flex-1 p-2", {
                "hover:bg-slate-100": isCollapsible,
                "cursor-default hover:bg-inherit": !isCollapsible,
                "p-3": !button,
              })}
              onClick={(clickEvent) => {
                handleToggleExpansion(clickEvent);
              }}
            >
              <CardTitleSection
                badge={badge}
                badgeAlignEnd={badgeAlignEnd}
                badgeAlignStart={badgeAlignStart}
                shouldShowBadge={shouldShowBadge}
                title={title}
                titleClassName={titleClassName}
              />
            </Button>
            {(!!isCollapsible || !!button) && (
              <HStack className="flex items-start gap-1 md:gap-2">
                {button}
                {!!actionMenu && actionMenu}
                {isCollapsible && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(clickEvent) => {
                      handleToggleExpansion(clickEvent);
                    }}
                  >
                    {isExpanded ? <CaretUp /> : <CaretDown />}
                  </Button>
                )}
              </HStack>
            )}
          </HStack>
        )}
      </VStack>
      {shouldShowChildren && (
        <VStack className="mt-1 md:mt-2">
          <hr className={cn("bg-slate-100")} />
          <div className={cn("px-3 py-4 md:py-6", childrenClassName)}>
            {children}
          </div>
        </VStack>
      )}
    </VStack>
  );
};
