"use client";

import * as React from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Command as CommandPrimitive } from "cmdk";

import {
  Dialog,
  DialogContent,
  type DialogContentProps,
  type DialogProps,
  DialogTitle,
} from "@components/ui/dialog";
import { cn } from "@lib/utils";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
      className,
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

type CommandDialogProps = DialogProps & {
  dialogTitle: React.ReactNode;
  fixed?: boolean;
  loop?: boolean;
  shouldFilter?: boolean;
  hasDialogContentComponentStyling?: boolean;
  animated?: DialogContentProps["animated"];
  minimalPadding?: boolean;
  autoFocusInput?: boolean;
  closeButton?: DialogContentProps["closeButton"];
  onEscapeKeyDown?: DialogContentProps["onEscapeKeyDown"];
  className?: string;
};
const CommandDialog: React.FC<CommandDialogProps> = ({
  children,
  dialogTitle,
  fixed = false,
  loop = true,
  shouldFilter,
  hasDialogContentComponentStyling,
  animated,
  minimalPadding,
  autoFocusInput = false,
  closeButton,
  onEscapeKeyDown,
  className,
  ...props
}) => {
  const contentRef = React.useRef<HTMLDivElement>(null);

  const focusCommandInput = React.useCallback(() => {
    const input = contentRef.current?.querySelector("[cmdk-input]");
    if (input instanceof HTMLInputElement) {
      input.focus();
    }
  }, []);

  React.useEffect(() => {
    if (!autoFocusInput) {
      return;
    }

    focusCommandInput();

    const firstAnimationFrame = requestAnimationFrame(() => {
      focusCommandInput();
      requestAnimationFrame(focusCommandInput);
    });
    const shortTimeout = window.setTimeout(focusCommandInput, 50);
    const longTimeout = window.setTimeout(focusCommandInput, 150);

    return () => {
      cancelAnimationFrame(firstAnimationFrame);
      window.clearTimeout(shortTimeout);
      window.clearTimeout(longTimeout);
    };
  }, [autoFocusInput, focusCommandInput]);

  return (
    <Dialog {...props}>
      <DialogContent
        ref={contentRef}
        animated={animated}
        className={cn(
          "overflow-hidden rounded-lg p-0 shadow-lg",
          "max-w-3xl pb-3",
          [
            hasDialogContentComponentStyling &&
              "bg-background fixed left-[50%] z-50 grid w-full translate-x-[-50%] gap-4 border p-2 shadow-lg sm:rounded-lg",
          ],
          [hasDialogContentComponentStyling && !minimalPadding && "p-6"],
          {
            "translate-y-0": fixed,
            // Fixed command dialogs intentionally keep 12 px of breathing room on each mobile edge.
            "w-[calc(100%_-_24px)]": fixed,
            "mt-3": fixed,
            "top-0": fixed,
            "md:mt-0": fixed,
            "md:top-[12%]": fixed,
          },
          className,
        )}
        closeButton={closeButton}
        minimalPadding={minimalPadding}
        onEscapeKeyDown={onEscapeKeyDown}
        onOpenAutoFocus={(event) => {
          if (!autoFocusInput) {
            return;
          }

          event.preventDefault();
          focusCommandInput();
        }}
      >
        <VisuallyHidden.Root>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </VisuallyHidden.Root>
        <Command
          loop={loop}
          shouldFilter={shouldFilter}
          className={cn(
            "[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-input]]:h-12",
            [
              !minimalPadding &&
                "[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group]]:px-2",
            ],
            { "p-0": minimalPadding },
          )}
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <MagnifyingGlass className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "placeholder:text-muted-foreground flex h-11 w-full rounded-md bg-transparent py-3 text-base outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-x-hidden overflow-y-auto", className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
      className,
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("bg-border -mx-1 h-px", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-3 py-2 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className,
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
