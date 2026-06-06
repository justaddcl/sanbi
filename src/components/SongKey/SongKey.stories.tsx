import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { songKeys } from "@lib/constants";

import { SongKey } from "./SongKey";

const meta = {
  title: "Songs/Song Key",
  component: SongKey,
  args: {
    songKey: "c",
  },
} satisfies Meta<typeof SongKey>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <SongKey songKey="c" size="small" />
      <SongKey songKey="c" size="medium" />
      <SongKey songKey="c" size="large" />
    </div>
  ),
};

export const Accidentals: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <SongKey songKey="c" size="large" />
      <SongKey songKey="f_sharp" size="large" />
      <SongKey songKey="b_flat" size="large" />
    </div>
  ),
};

export const Muted: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <SongKey songKey="g" size="small" muted />
      <SongKey songKey="g" size="medium" muted />
      <SongKey songKey="g" size="large" muted />
    </div>
  ),
};

export const AllKeys: Story = {
  render: () => (
    <div className="flex max-w-md flex-wrap gap-3">
      {songKeys.map((songKey) => (
        <SongKey key={songKey} songKey={songKey} size="medium" />
      ))}
    </div>
  ),
};
