import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ActionMenu, ActionMenuItem } from "./ActionMenu";

const ActionMenuExample = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-52 items-start justify-end">
      <ActionMenu isOpen={isOpen} setIsOpen={setIsOpen}>
        <ActionMenuItem icon="Pencil" label="Rename set" />
        <ActionMenuItem icon="Copy" label="Duplicate set" />
        <ActionMenuItem icon="Trash" label="Delete set" destructive />
      </ActionMenu>
    </div>
  );
};

const meta = {
  title: "Base Components/Action Menu",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  render: () => <ActionMenuExample />,
};
