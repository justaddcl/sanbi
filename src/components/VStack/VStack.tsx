import React from "react";

import { type PolymorphicComponentProps } from "@lib/types";
import { cn } from "@/lib/utils";

export const VStack = React.forwardRef(
  <HTMLElement extends React.ElementType = "div">(
    {
      as,
      children,
      className,
      ...props
    }: PolymorphicComponentProps<HTMLElement>,
    ref: React.ComponentPropsWithRef<HTMLElement>["ref"],
  ) => {
    const ComponentTag = as ?? "div";
    return (
      <ComponentTag
        ref={ref}
        className={cn(`flex flex-col`, className)}
        {...props}
      >
        {children}
      </ComponentTag>
    );
  },
);

VStack.displayName = "VStack";
