import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const meta = {
  title: "Base Components/Popover",
  component: Popover,
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="outline">Section options</Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <div className="grid gap-2">
          <p className="text-sm font-medium text-slate-900">Section label</p>
          <p className="text-sm text-slate-500">
            Use section labels to group songs within a set list.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
