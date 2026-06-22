import { CommandIcon } from "@phosphor-icons/react/dist/ssr";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HStack } from "@components/HStack";

import { Keycap } from "./Keycap";

const meta = {
  title: "Base Components/Keycap",
  component: Keycap,
  decorators: [
    (Story) => (
      <HStack className="items-center gap-2">
        <Story />
      </HStack>
    ),
  ],
} satisfies Meta<typeof Keycap>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Outline: Story = {
  args: {
    children: "K",
  },
};

export const Icon: Story = {
  args: {
    children: <CommandIcon aria-hidden size={15} />,
    label: "Command",
  },
};

export const Plain: Story = {
  args: {
    children: "Esc",
    label: "Escape",
    variant: "plain",
  },
};
