import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { ActionMenu, ActionMenuItem } from "@components/ActionMenu";
import { Text } from "@components/Text";

import { Card } from "./Card";
import { CardTitleSection } from "./CardTitleSection";

const CardActionMenu = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <ActionMenu
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      buttonVariant="ghost"
      triggerLabel="Open card actions"
    >
      <ActionMenuItem icon="Pencil" label="Rename" />
      <ActionMenuItem icon="Copy" label="Duplicate" />
      <ActionMenuItem icon="Trash" label="Delete" destructive />
    </ActionMenu>
  );
};

const meta = {
  title: "Base Components/Card Surfaces",
  component: Card,
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Card title="Opening songs">
      <Text className="text-sm text-slate-600">
        Use cards to group set sections, song details, and resource surfaces.
      </Text>
    </Card>
  ),
};

export const WithBadgeAndButton: Story = {
  render: () => (
    <Card
      title="Response"
      badge={<Badge variant="secondary">3 songs</Badge>}
      button={
        <Button size="sm" variant="outline" leftIcon={<Plus size={14} />}>
          Add
        </Button>
      }
      actionMenu={<CardActionMenu />}
    >
      <div className="grid gap-2 text-sm text-slate-600">
        <p>Goodness of God</p>
        <p>Build My Life</p>
        <p>Holy Forever</p>
      </div>
    </Card>
  ),
};

export const CollapsibleCollapsed: Story = {
  render: () => (
    <Card
      title="Archived section"
      badge={<Badge variant="warn">Hidden</Badge>}
      collapsible
      initialIsExpanded={false}
      hideBadgeWhenExpanded
    >
      <Text className="text-sm text-slate-600">
        This content is hidden until the section is expanded.
      </Text>
    </Card>
  ),
};

export const CustomHeader: Story = {
  render: () => (
    <Card
      header={
        <div className="rounded bg-slate-50 p-3">
          <CardTitleSection
            title="Custom card header"
            shouldShowBadge
            badge={<Badge variant="outline">Manual</Badge>}
          />
        </div>
      }
      externalIsExpanded
    >
      <Text className="text-sm text-slate-600">
        Production set-section cards pass a custom header into this surface.
      </Text>
    </Card>
  ),
};
