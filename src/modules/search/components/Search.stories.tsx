import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TRPCProvider } from "@lib/trpc/client";

import { Search } from "./Search";

const SearchStoryProviders: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider queryClient={queryClient}>{children}</TRPCProvider>
    </QueryClientProvider>
  );
};

const meta = {
  title: "Search/Search",
  component: Search,
  args: {
    className: "max-w-3xl",
  },
  decorators: [
    (Story) => (
      <SearchStoryProviders>
        <Story />
      </SearchStoryProviders>
    ),
  ],
} satisfies Meta<typeof Search>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="grid min-h-40 place-items-center bg-slate-50 p-6">
      <Search {...args} />
    </div>
  ),
};

export const Compact: Story = {
  render: (args) => (
    <div className="w-80 bg-slate-50 p-4">
      <Search {...args} className="max-w-none" />
    </div>
  ),
};
