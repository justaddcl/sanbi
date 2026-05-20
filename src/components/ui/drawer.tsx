"use client";

import * as React from "react";
import {
  type DialogCloseProps as RadixDialogCloseProps,
  type DialogTriggerProps as RadixDialogTriggerProps,
} from "@radix-ui/react-dialog";
import {
  type DialogProps as VaulDrawerProps,
  Drawer as DrawerPrimitive,
} from "vaul";

import { cn } from "@lib/utils";

export type DrawerProps = VaulDrawerProps;

let drawerScrollLockCount = 0;
let restorePageScroll: (() => void) | null = null;

const lockPageScroll = () => {
  drawerScrollLockCount += 1;

  if (drawerScrollLockCount > 1) {
    return;
  }

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;

  // Vaul input repositioning is disabled for iOS keyboard stability, so lock
  // the page ourselves while leaving the fixed drawer content scrollable.
  const originalHtmlStyles = {
    overflow: document.documentElement.style.overflow,
    overscrollBehavior: document.documentElement.style.overscrollBehavior,
  };
  const originalBodyStyles = {
    left: document.body.style.left,
    overflow: document.body.style.overflow,
    paddingRight: document.body.style.paddingRight,
    position: document.body.style.position,
    right: document.body.style.right,
    top: document.body.style.top,
    width: document.body.style.width,
  };

  document.documentElement.style.overflow = "hidden";
  document.documentElement.style.overscrollBehavior = "none";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = `-${scrollX}px`;
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }

  restorePageScroll = () => {
    document.documentElement.style.overflow = originalHtmlStyles.overflow;
    document.documentElement.style.overscrollBehavior =
      originalHtmlStyles.overscrollBehavior;
    document.body.style.left = originalBodyStyles.left;
    document.body.style.overflow = originalBodyStyles.overflow;
    document.body.style.paddingRight = originalBodyStyles.paddingRight;
    document.body.style.position = originalBodyStyles.position;
    document.body.style.right = originalBodyStyles.right;
    document.body.style.top = originalBodyStyles.top;
    document.body.style.width = originalBodyStyles.width;
    window.scrollTo(scrollX, scrollY);
    restorePageScroll = null;
  };
};

const unlockPageScroll = () => {
  drawerScrollLockCount = Math.max(0, drawerScrollLockCount - 1);

  if (drawerScrollLockCount === 0) {
    restorePageScroll?.();
  }
};

const usePageScrollLock = (isLocked: boolean) => {
  React.useLayoutEffect(() => {
    if (!isLocked) {
      return;
    }

    lockPageScroll();

    return unlockPageScroll;
  }, [isLocked]);
};

const Drawer = ({
  defaultOpen,
  noBodyStyles = true,
  onOpenChange,
  open,
  repositionInputs = false,
  ...props
}: DrawerProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false,
  );
  const isOpen = open ?? uncontrolledOpen;

  usePageScrollLock(isOpen && noBodyStyles);

  const handleOpenChange = (nextOpen: boolean) => {
    setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <DrawerPrimitive.Root
      defaultOpen={defaultOpen}
      noBodyStyles={noBodyStyles}
      onOpenChange={handleOpenChange}
      open={open}
      repositionInputs={repositionInputs}
      {...props}
    />
  );
};
Drawer.displayName = "Drawer";

export type DrawerTriggerProps = RadixDialogTriggerProps;
const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

export type DrawerCloseProps = RadixDialogCloseProps;
const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

export type DrawerContentProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Content
>;
const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex max-h-[82vh] flex-col overflow-hidden rounded-t-[10px] border bg-background",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col overflow-y-auto rounded-t-[10px] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <DrawerPrimitive.Handle />
        {children}
      </div>
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

export type DrawerHeaderProps = React.HTMLAttributes<HTMLDivElement>;
const DrawerHeader = ({ className, ...props }: DrawerHeaderProps) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

export type DrawerFooterProps = React.HTMLAttributes<HTMLDivElement>;
const DrawerFooter = ({ className, ...props }: DrawerFooterProps) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

export type DrawerTitleProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Title
>;
const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  DrawerTitleProps
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

export type DrawerDescriptionProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Description
>;
const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  DrawerDescriptionProps
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
};
