import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SetEmptyState } from "./SetEmptyState";

const meta = {
  title: "Sets/Set Empty State",
  component: SetEmptyState,
  decorators: [
    (Story) => (
      <div className="flex min-h-96 max-w-3xl rounded-md border border-slate-200">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SetEmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    onActionClick: () => undefined,
  },
};
