import React, { useEffect } from "react";
import type { Decorator, Preview } from "@storybook/nextjs-vite";

import { Toaster } from "@components/ui/sonner";
import { TooltipProvider } from "@components/ui/tooltip";

import "../src/styles/globals.css";

const LightModeFrame: React.FC<React.PropsWithChildren> = ({ children }) => {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
    document.documentElement.style.setProperty(
      "--font-poppins",
      "Poppins, ui-sans-serif, system-ui, sans-serif",
    );
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-white p-6 font-sans text-slate-900 md:p-10">
        {children}
      </div>
      <Toaster />
    </TooltipProvider>
  );
};

const withLightMode: Decorator = (Story) => (
  <LightModeFrame>
    <Story />
  </LightModeFrame>
);

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#ffffff" }],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        method: "alphabetical",
        order: [
          "Base Components",
          "App Shell",
          "Event Types",
          "Onboarding",
          "Resources",
          "Sets",
          "Shared Workflows",
          "Songs",
        ],
        includeNames: true,
      },
    },
  },
  decorators: [withLightMode],
};

export default preview;
