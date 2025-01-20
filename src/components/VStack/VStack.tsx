import { cn } from "@/lib/utils";
import { type PolymorphicComponentProps } from "@lib/types";

export const VStack = <HTMLElement extends React.ElementType = "div">({
  as,
  children,
  className,
  ...props
}: PolymorphicComponentProps<HTMLElement>) => {
  const HTMLElement = as ?? "div";
  return (
    <HTMLElement className={cn(`flex flex-col`, className)} {...props}>
      {children}
    </HTMLElement>
  );
};
