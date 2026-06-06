import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { VStack } from "./VStack";

const SampleBlock = ({ label }: { label: string }) => (
  <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
    {label}
  </div>
);

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
