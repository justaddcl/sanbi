import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { VStack } from "./VStack";
import { SampleBlock } from "../../../.storybook/story-helpers";

const meta = {
  title: "Base Components/VStack",
  component: VStack,
} satisfies Meta<typeof VStack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <VStack className="max-w-sm gap-3">
      <SampleBlock label="Header" />
      <SampleBlock label="Content" />
      <SampleBlock label="Footer" />
    </VStack>
  ),
};
