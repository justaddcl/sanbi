import { cn } from "@/lib/utils";
import { type PolymorphicComponentProps } from "@lib/types";

export const HStack = <HTMLElement extends React.ElementType = "div">({
  as,
  children,
  className,
  ...props
}: PolymorphicComponentProps<HTMLElement>) => {
  const HTMLElement = as ?? "div";
  return (
    <HTMLElement className={cn(`flex flex-row`, className)} {...props}>
      {children}
    </HTMLElement>
  );
};
