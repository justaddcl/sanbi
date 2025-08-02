"use client";

import React from "react";

import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { cn } from "@lib/utils";

type TitleSectionProps = {
  badge?: React.ReactElement;
  badgeAlignEnd?: boolean;
  badgeAlignStart?: boolean;
  shouldShowBadge: boolean;
  title: string;
  titleClassName?: string;
};

export const CardTitleSection: React.FC<TitleSectionProps> = ({
  badge,
  badgeAlignEnd,
  badgeAlignStart,
  shouldShowBadge,
  title,
  titleClassName,
}) => (
  <HStack
    className={cn("flex-1 items-center gap-4", {
      "justify-start": badgeAlignStart,
      "justify-between": badgeAlignEnd,
    })}
  >
    <Text
      asElement="h3"
      style="header-medium-semibold"
      className={cn(
        "font-medium md:text-xl md:text-slate-700 lg:font-semibold",
        titleClassName,
      )}
    >
      {title}
    </Text>
    {shouldShowBadge && badge}
  </HStack>
);