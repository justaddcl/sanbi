import { cn } from "@/lib/utils";
import { type DetailedHTMLProps, type HTMLAttributes, type FC } from "react";
type HStackProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export const HStack: FC<HStackProps> = ({ className, ...props }) => {
  return <div className={cn(`flex flex-row`, className)} {...props}></div>;
};
