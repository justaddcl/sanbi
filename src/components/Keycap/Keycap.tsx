import { type ReactNode } from "react";

import { cn } from "@lib/utils";

type KeycapProps = {
  children: ReactNode;
  label?: string;
  variant?: "outline" | "plain";
};

export const Keycap = ({
  children,
  label,
  variant = "outline",
}: KeycapProps) => (
  <kbd
    className={cn(
      "inline-flex items-center justify-center leading-none font-medium text-slate-500",
      variant === "outline"
        ? "h-6 min-w-6 rounded border border-slate-200 bg-slate-50 px-1.5 text-[11px] shadow-[0_1px_0_rgba(15,23,42,0.04)]"
        : "min-w-3 text-[10px]",
    )}
    title={label}
  >
    {children}
    {label && <span className="sr-only">{label}</span>}
  </kbd>
);
