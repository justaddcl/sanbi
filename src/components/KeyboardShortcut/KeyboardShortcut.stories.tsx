import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { KeyboardShortcut } from "./KeyboardShortcut";

const meta = {
  title: "Base Components/Keyboard Shortcut",
  component: KeyboardShortcut,
  args: {
    primaryKey: "K",
  },
} satisfies Meta<typeof KeyboardShortcut>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SingleKey: Story = {};

export const KeyChord: Story = {
  args: {
    primaryKey: "⌘",
    secondaryKey: "K",
    label: "Search songs",
  },
};
