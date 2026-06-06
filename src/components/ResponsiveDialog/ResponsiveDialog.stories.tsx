import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@components/ui/button";
import {
  DESKTOP_MEDIA_QUERY_STRING,
  MOBILE_MEDIA_QUERY_STRING,
} from "@lib/constants/mediaQueries";

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "./ResponsiveDialog";

type ResponsiveMode = "desktop" | "mobile";

const setResponsiveMode = (mode: ResponsiveMode) => {
  if (typeof window === "undefined") {
    return;
  }

  window.matchMedia = (query: string): MediaQueryList => {
    const matches =
      mode === "desktop"
        ? query === DESKTOP_MEDIA_QUERY_STRING
        : query === MOBILE_MEDIA_QUERY_STRING;

    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
    };
  };
};

const ResponsiveDialogExample = ({ mode }: { mode: ResponsiveMode }) => {
  setResponsiveMode(mode);

  return (
    <ResponsiveDialog open>
      <ResponsiveDialogTrigger asChild>
        <Button>Open</Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Create new item</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Choose whether this interaction renders as a dialog or drawer.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="grid gap-2 py-4 text-sm text-slate-600">
          <p>New set</p>
          <p>New song</p>
        </div>
        <ResponsiveDialogFooter>
          <Button>Continue</Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

const meta = {
  title: "App Shell/Responsive Dialog",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const DesktopDialog: Story = {
  render: () => <ResponsiveDialogExample mode="desktop" />,
};

export const MobileDrawer: Story = {
  render: () => <ResponsiveDialogExample mode="mobile" />,
};
