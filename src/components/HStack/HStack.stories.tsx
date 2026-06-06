import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HStack } from "./HStack";

const SampleBlock = ({ label }: { label: string }) => (
  <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
    {label}
  </div>
);

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
