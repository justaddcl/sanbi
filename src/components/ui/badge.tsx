import * as React from "react";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
    dismissLabel?: string;
    onDismiss?: () => void;
    onDismissPending?: boolean;
  };

function Badge({
  className,
  variant,
  dismissable,
  dismissLabel,
  onDismiss,
  onDismissPending,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
      {dismissable && onDismiss && (
        <button
          type="button"
          onClick={(closeEvent) => {
            closeEvent.stopPropagation();
            onDismiss();
          }}
          aria-label={dismissLabel}
          disabled={onDismissPending}
          className="ring-offset-background focus:ring-ring ml-2 rounded-full outline-hidden focus:ring-2 focus:ring-offset-2"
        >
          <X className="text-muted-foreground hover:text-foreground h-3.5 w-3.5 transition-colors" />
        </button>
      )}
    </div>
  );
}

export { Badge, badgeVariants };
