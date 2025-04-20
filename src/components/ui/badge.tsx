import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { X } from "@phosphor-icons/react/dist/ssr/X";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        warn: "text-amber-700 border-amber-200 bg-amber-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants> & {
    dismissable?: boolean;
    onClose?: () => void;
    onClosePending?: boolean;
  };

function Badge({
  className,
  variant,
  dismissable,
  onClose,
  onClosePending,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
      {dismissable && onClose && (
        <button
          onClick={(closeEvent) => {
            closeEvent.stopPropagation();
            onClose();
          }}
          disabled={onClosePending}
          className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground transition-colors hover:text-foreground" />
        </button>
      )}
    </div>
  );
}

export { Badge, badgeVariants };
