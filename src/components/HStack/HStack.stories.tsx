import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HStack } from "./HStack";
import { SampleBlock } from "../../../.storybook/story-helpers";

const meta = {
  title: "Base Components/HStack",
  component: HStack,
} satisfies Meta<typeof HStack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HStack className="items-center gap-3">
      <SampleBlock label="Song" />
      <SampleBlock label="Key" />
      <SampleBlock label="Actions" />
    </HStack>
  ),
};
