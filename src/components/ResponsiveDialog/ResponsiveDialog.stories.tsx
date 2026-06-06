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

const createResponsiveMatchMedia =
  (mode: ResponsiveMode) =>
  (query: string): MediaQueryList => {
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

const withResponsiveMode = (mode: ResponsiveMode) => () => {
  if (typeof window === "undefined") {
    return;
  }

  const originalMatchMedia = window.matchMedia;

  window.matchMedia = createResponsiveMatchMedia(mode);

  return () => {
    window.matchMedia = originalMatchMedia;
  };
};

const ResponsiveDialogExample = () => {
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
  beforeEach: withResponsiveMode("desktop"),
  render: () => <ResponsiveDialogExample />,
};

export const MobileDrawer: Story = {
  beforeEach: withResponsiveMode("mobile"),
  render: () => <ResponsiveDialogExample />,
};
