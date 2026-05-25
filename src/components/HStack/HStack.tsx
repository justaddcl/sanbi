import type React from "react";

import { type PolymorphicComponentProps } from "@lib/types";
import { cn } from "@/lib/utils";

export const HStack = <HTMLElement extends React.ElementType = "div">({
  as,
  children,
  className,
  ref,
  ...props
}: PolymorphicComponentProps<HTMLElement> & {
  ref?: React.ComponentPropsWithRef<HTMLElement>["ref"];
}) => {
  const ComponentTag = as ?? "div";
  return (
    <ComponentTag ref={ref} className={cn("flex flex-row", className)} {...props}>
      {children}
    </ComponentTag>
  );
};

HStack.displayName = "HStack";
