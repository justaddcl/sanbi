import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Textarea } from "./textarea";

const meta = {
  title: "Base Components/Textarea",
  component: Textarea,
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="grid max-w-lg gap-4">
      <Textarea value="Normal textarea" onChange={() => undefined} />
      <Textarea placeholder="Placeholder textarea" />
      <Textarea disabled value="Disabled textarea" onChange={() => undefined} />
    </div>
  ),
};
