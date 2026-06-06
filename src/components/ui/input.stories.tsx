import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "./input";

const meta = {
  title: "Base Components/Input",
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="grid max-w-lg gap-4">
      <Input value="Normal input" onChange={() => undefined} />
      <Input placeholder="Placeholder input" />
      <Input disabled value="Disabled input" onChange={() => undefined} />
      <Input size="small" value="Small input" onChange={() => undefined} />
    </div>
  ),
};
