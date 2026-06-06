import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { Resource } from "@lib/types";

import { ResourceCardDisplay } from "./ResourceCardDisplay";

const resourceFixture = (overrides: Partial<Resource> = {}): Resource => ({
  id: "resource-1",
  songId: "song-1",
  organizationId: "organization-1",
  title: "Acoustic guitar tutorial",
  url: "https://www.youtube.com/watch?v=sanbi",
  status: "ready",
  metaTitle: "Acoustic guitar tutorial",
  metaDescription: "A walkthrough for the Sunday arrangement.",
  faviconUrl: null,
  imageUrl: "/song-resource-empty-states/song-resource-empty-state.webp",
  lastFetchedAt: new Date("2026-06-01T12:00:00.000Z"),
  createdAt: new Date("2026-06-01T12:00:00.000Z"),
  updatedAt: new Date("2026-06-01T12:00:00.000Z"),
  ...overrides,
});

const ResourceCardDisplayExample: React.FC<{
  resource: Resource;
  isRefreshPending?: boolean;
}> = ({ resource, isRefreshPending = false }) => {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(true);

  return (
    <ul className="grid max-w-xl gap-3">
      <ResourceCardDisplay
        resource={resource}
        isActionMenuOpen={isActionMenuOpen}
        setIsActionMenuOpen={setIsActionMenuOpen}
        isRefreshPending={isRefreshPending}
        onEdit={() => undefined}
        onRefreshPreview={() => undefined}
        onUnlink={() => undefined}
      />
    </ul>
  );
};

const meta = {
  title: "Resources/Resource Card",
  component: ResourceCardDisplay,
  args: {
    resource: resourceFixture(),
    isActionMenuOpen: false,
    setIsActionMenuOpen: () => undefined,
    onEdit: () => undefined,
    onRefreshPreview: () => undefined,
    onUnlink: () => undefined,
  },
} satisfies Meta<typeof ResourceCardDisplay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  render: () => <ResourceCardDisplayExample resource={resourceFixture()} />,
};

export const FallbackThumbnail: Story = {
  render: () => (
    <ResourceCardDisplayExample
      resource={resourceFixture({
        title: null,
        metaTitle: "Planning Center chart",
        imageUrl: null,
        faviconUrl: null,
        url: "https://services.planningcenteronline.com/songs/123",
      })}
    />
  ),
};

export const RefreshPending: Story = {
  render: () => (
    <ResourceCardDisplayExample resource={resourceFixture()} isRefreshPending />
  ),
};
