import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SetListCard } from "./SetListCard";
import { SetListCardHeader } from "../SetListCardHeader";
import { SetListCardSection } from "../SetListCardSection";
import { SongContent } from "../SongContent";

const meta = {
  title: "Sets/Set List Card",
  component: SetListCard,
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SetListCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithSections: Story = {
  render: () => (
    <SetListCard>
      <SetListCardHeader
        date="2026-06-14T09:00:00.000Z"
        type="Sunday service"
        numberOfSongs={5}
      />
      <div className="grid gap-5">
        <SetListCardSection title="Opening">
          <SongContent index={1} songKey="a" name="House of the Lord" />
          <SongContent
            index={2}
            songKey="g_flat"
            name="Great Are You Lord"
            notes="Acoustic intro. Hold before final chorus."
          />
        </SetListCardSection>
        <SetListCardSection title="Response">
          <SongContent index={3} songKey="b_flat" name="Goodness of God" />
          <SongContent index={4} songKey="d" name="Build My Life" muted />
        </SetListCardSection>
      </div>
    </SetListCard>
  ),
};

export const HeaderOnly: Story = {
  render: () => (
    <SetListCard>
      <SetListCardHeader
        date="2026-07-01T19:30:00.000Z"
        type="Youth night"
        numberOfSongs={1}
      />
    </SetListCard>
  ),
};
