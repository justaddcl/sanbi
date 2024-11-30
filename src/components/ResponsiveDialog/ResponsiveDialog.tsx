import type React from "react";
import { useMediaQuery } from "usehooks-ts";
import {
  Dialog,
  DialogClose,
  type DialogCloseProps,
  DialogContent,
  type DialogContentProps,
  DialogDescription,
  type DialogDescriptionProps,
  DialogFooter,
  type DialogFooterProps,
  DialogHeader,
  type DialogHeaderProps,
  type DialogProps,
  DialogTitle,
  type DialogTitleProps,
  DialogTrigger,
  type DialogTriggerProps,
} from "@components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  type DrawerCloseProps,
  DrawerContent,
  type DrawerContentProps,
  DrawerDescription,
  type DrawerDescriptionProps,
  DrawerFooter,
  type DrawerFooterProps,
  DrawerHeader,
  type DrawerHeaderProps,
  type DrawerProps,
  DrawerTitle,
  type DrawerTitleProps,
  DrawerTrigger,
  type DrawerTriggerProps,
} from "@components/ui/drawer";

const DESKTOP_MEDIA_QUERY_STRING = "(min-width: 1025px)";

type ResponsiveDialogProps = React.PropsWithChildren & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  drawerProps?: DrawerProps;
  dialogProps?: DialogProps;
};

export const ResponsiveDialog: React.FC<ResponsiveDialogProps> = ({
  drawerProps,
  dialogProps,
  children,
  ...sharedProps
}) => {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY_STRING);

  return isDesktop ? (
    <Dialog {...sharedProps} {...dialogProps}>
      {children}
    </Dialog>
  ) : (
    <Drawer {...sharedProps} {...drawerProps}>
      {children}
    </Drawer>
  );
};

type ResponsiveDialogTriggerProps = React.PropsWithChildren & {
  asChild?: boolean;
  dialogProps?: DialogTriggerProps;
  drawerProps?: DrawerTriggerProps;
};

export const ResponsiveDialogTrigger: React.FC<
  ResponsiveDialogTriggerProps
> = ({ dialogProps, drawerProps, children, ...sharedProps }) => {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY_STRING);
  return isDesktop ? (
    <DialogTrigger {...sharedProps} {...dialogProps}>
      {children}
    </DialogTrigger>
  ) : (
    <DrawerTrigger {...sharedProps} {...drawerProps}>
      {children}
    </DrawerTrigger>
  );
};

type ResponsiveDialogCloseProps = React.PropsWithChildren & {
  asChild?: boolean;
  dialogProps?: DialogCloseProps;
  drawerProps?: DrawerCloseProps;
};

export const ResponsiveDialogClose: React.FC<ResponsiveDialogCloseProps> = ({
  dialogProps,
  drawerProps,
  children,
  ...sharedProps
}) => {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY_STRING);

  return isDesktop ? (
    <DialogClose {...sharedProps} {...dialogProps}>
      {children}
    </DialogClose>
  ) : (
    <DrawerClose {...sharedProps} {...drawerProps}>
      {children}
    </DrawerClose>
  );
};

type ResponsiveDialogContentProps = React.PropsWithChildren & {
  className?: string;
  dialogProps?: DialogContentProps;
  drawerProps?: DrawerContentProps;
};

export const ResponsiveDialogContent: React.FC<
  ResponsiveDialogContentProps
> = ({ dialogProps, drawerProps, children, ...sharedProps }) => {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY_STRING);

  return isDesktop ? (
    <DialogContent {...sharedProps} {...dialogProps}>
      {children}
    </DialogContent>
  ) : (
    <DrawerContent {...sharedProps} {...drawerProps}>
      {children}
    </DrawerContent>
  );
};

type ResponsiveDialogHeaderProps = React.PropsWithChildren & {
  dialogProps?: DialogHeaderProps;
  drawerProps?: DrawerHeaderProps;
};

export const ResponsiveDialogHeader: React.FC<ResponsiveDialogHeaderProps> = ({
  dialogProps,
  drawerProps,
  children,
}) => {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY_STRING);

  return isDesktop ? (
    <DialogHeader {...dialogProps}>{children}</DialogHeader>
  ) : (
    <DrawerHeader {...drawerProps}>{children}</DrawerHeader>
  );
};

type ResponsiveDialogTitle = React.PropsWithChildren & {
  dialogProps?: DialogTitleProps;
  drawerProps?: DrawerTitleProps;
};
export const ResponsiveDialogTitle: React.FC<ResponsiveDialogTitle> = ({
  dialogProps,
  drawerProps,
  children,
}) => {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY_STRING);

  return isDesktop ? (
    <DialogTitle {...dialogProps}>{children}</DialogTitle>
  ) : (
    <DrawerTitle {...drawerProps}>{children}</DrawerTitle>
  );
};

type ResponsiveDialogDescriptionProps = React.PropsWithChildren & {
  dialogProps?: DialogDescriptionProps;
  drawerProps?: DrawerDescriptionProps;
};
export const ResponsiveDialogDescription: React.FC<
  ResponsiveDialogDescriptionProps
> = ({ dialogProps, drawerProps, children }) => {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY_STRING);

  return isDesktop ? (
    <DialogDescription {...dialogProps}>{children}</DialogDescription>
  ) : (
    <DrawerDescription {...drawerProps}>{children}</DrawerDescription>
  );
};

type ResponsiveDialogFooterProps = React.PropsWithChildren & {
  dialogProps?: DialogFooterProps;
  drawerProps?: DrawerFooterProps;
};
export const ResponsiveDialogFooter: React.FC<ResponsiveDialogFooterProps> = ({
  dialogProps,
  drawerProps,
  children,
}) => {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY_STRING);

  return isDesktop ? (
    <DialogFooter {...dialogProps}>{children}</DialogFooter>
  ) : (
    <DrawerFooter {...drawerProps}>{children}</DrawerFooter>
  );
};
