import type React from "react";

export type None<Type> = {
  [Property in keyof Type]?: never;
};

export type PolymorphicComponentProps<
  HTMLElement extends React.ElementType,
  Props = object,
> = Props & {
  as?: HTMLElement;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<HTMLElement>, keyof Props>;
