import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Text } from "@components/Text";

import { HighlightedText } from "./HighlightedText";

const meta = {
  title: "Base Components/Highlighted Text",
  component: HighlightedText,
  args: {
    query: "grace",
    text: "Amazing Grace",
  },
  decorators: [
    (Story) => (
      <Text style="header-small-semibold" className="text-slate-500">
        <Story />
      </Text>
    ),
  ],
} satisfies Meta<typeof HighlightedText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Match: Story = {};

export const CaseInsensitive: Story = {
  args: {
    query: "amazing",
    text: "Amazing Grace",
  },
};

export const NoMatch: Story = {
  args: {
    query: "chorus",
    text: "Amazing Grace",
  },
};
