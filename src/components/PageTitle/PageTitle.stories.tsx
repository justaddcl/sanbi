import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "@components/ui/badge";

import { PageTitle } from "./PageTitle";

const meta = {
  title: "App Shell/Page Title",
  component: PageTitle,
  args: {
    title: "Sunday Service",
  },
} satisfies Meta<typeof PageTitle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {};

export const WithSupportingText: Story = {
  args: {
    subtitle: "June 14, 2026",
    details: "5 songs · 2 sections",
  },
};

export const WithBadge: Story = {
  args: {
    subtitle: "June 14, 2026",
    details: "Main hall",
    badge: <Badge variant="warn">Archived</Badge>,
  },
};
