import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  SongResourcesEmptyState,
  SongResourcesEmptyStateBackupArt,
} from "./SongResourcesEmptyState";

const meta = {
  title: "Resources/Song Resources Empty State",
  component: SongResourcesEmptyState,
  args: {
    onAddResourceClick: () => undefined,
  },
  decorators: [
    (Story) => (
      <ul className="grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof SongResourcesEmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithPublicArtwork: Story = {
  args: {},
};

export const BackupArtwork: Story = {
  args: {},
  render: () => (
    <li className="flex min-h-56 items-center justify-center rounded-md bg-white">
      <SongResourcesEmptyStateBackupArt />
    </li>
  ),
};
