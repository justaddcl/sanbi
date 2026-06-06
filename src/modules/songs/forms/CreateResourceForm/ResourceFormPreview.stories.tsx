import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ResourceFormPreview } from "./ResourceFormPreview";

const meta = {
  title: "Resources/Resource Form Preview",
  component: ResourceFormPreview,
  args: {
    title: "",
    url: "https://example.com",
    isLoading: false,
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResourceFormPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithMetadata: Story = {
  args: {
    title: "Sunday arrangement reference",
    url: "https://example.com/sunday-arrangement",
    previewMetadata: {
      normalizedUrl: "https://example.com/sunday-arrangement",
      status: "ready",
      title: "Sunday arrangement reference",
      description: "Chord chart, rehearsal notes, and reference audio.",
      imageUrl: "/song-resource-empty-states/song-resource-empty-state.webp",
      faviconUrl: null,
      lastFetchedAt: new Date("2026-06-01T12:00:00.000Z"),
    },
    isLoading: false,
  },
};

export const FallbackThumbnail: Story = {
  args: {
    title: "",
    url: "https://open.spotify.com/track/sanbi",
    previewMetadata: {
      normalizedUrl: "https://open.spotify.com/track/sanbi",
      status: "ready",
      title: "Spotify reference track",
      description: null,
      imageUrl: null,
      faviconUrl: null,
      lastFetchedAt: new Date("2026-06-01T12:00:00.000Z"),
    },
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    title: null,
    url: "https://example.com/loading",
    isLoading: true,
  },
};
