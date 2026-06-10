import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Search } from "./Search";

const meta = {
  title: "Search/Search",
  component: Search,
  args: {
    className: "max-w-3xl",
  },
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
