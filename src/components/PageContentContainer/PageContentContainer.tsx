import { VStack } from "@components/VStack";
import { cn } from "@lib/utils";
import React from "react";

export type PageContentContainerProps =
  React.ComponentPropsWithoutRef<"div"> & {
    as?: React.ElementType;
    className?: string;
  };

export const PageContentContainer = ({
  as = "div",
  children,
  className,
  ...props
}: PageContentContainerProps) => (
  <VStack
    as={as}
    className={cn(
      "mx-auto w-[min(100%,_800px)] justify-center gap-6 md:px-8 lg:mt-8 lg:px-0",
      className,
    )}
    {...props}
  >
    {children}
  </VStack>
);
