import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge as SanbiBadge } from "@components/Badge/Badge";

import { Badge } from "./badge";

const meta = {
  title: "Base Components/Badge",
  component: Badge,
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const UiVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="warn">Warning</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge dismissable onDismiss={() => undefined}>
        Dismissable
      </Badge>
    </div>
  ),
};

export const SanbiSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <SanbiBadge label="Rehearsal" size="sm" />
      <SanbiBadge label="Sunday service" />
    </div>
  ),
};
