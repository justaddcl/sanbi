"use client";

import * as React from "react";
import { X } from "@phosphor-icons/react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  type DialogCloseProps as RadixDialogCloseProps,
  type DialogProps as RadixDialogProps,
  type DialogTriggerProps as RadixDialogTriggerProps,
} from "@radix-ui/react-dialog";

import { cn } from "@lib/utils";

export type DialogProps = RadixDialogProps;
const Dialog = DialogPrimitive.Root;

export type DialogTriggerProps = RadixDialogTriggerProps;
const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

export type DialogCloseProps = RadixDialogCloseProps;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 overflow-y-auto bg-black/80",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export type DialogContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  fixed?: boolean;
  animated?: boolean;
  minimalPadding?: boolean;
  closeButton?: React.ReactNode;
};
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      className,
      fixed,
      animated = true,
      minimalPadding = false,
      closeButton,
      children,
      ...props
    },
    ref,
  ) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "bg-background fixed top-[50%] left-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto rounded-lg border p-6 shadow-lg lg:p-8",
          {
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-200":
              animated,
          },
          {
            "max-w-3xl": fixed,
            "translate-y-0": fixed,
            "w-[calc(100%-24px)]": fixed,
            "mt-3": fixed,
            "top-0": fixed,
            "md:mt-0": fixed,
            "md:top-[12%]": fixed,
            "lg:top-[25%]": fixed,
          },
          {
            "max-w-lg": !fixed,
          },
          {
            "p-2 lg:p-2": minimalPadding,
          },
          className,
        )}
        {...props}
      >
        {children}
        {closeButton !== undefined ? (
          closeButton
        ) : (
          <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  ),
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

export type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: "center" | "left";
};
const DialogHeader = ({
  align = "center",
  className,
  ...props
}: DialogHeaderProps) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 sm:text-left",
      { "text-center": align === "center" },
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

export type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>;
const DialogFooter = ({ className, ...props }: DialogFooterProps) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

export type DialogTitleProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Title
> & {
  size?: "md" | "lg";
};
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>(({ size = "lg", className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "leading-none font-semibold tracking-tight",
      [size === "md" && "text-base"],
      [size === "lg" && "text-lg"],
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export type DialogDescriptionProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Description
>;
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
