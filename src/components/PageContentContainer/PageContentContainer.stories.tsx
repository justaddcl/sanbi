import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PageContentContainer } from "./PageContentContainer";
import { SampleBlock } from "../../../.storybook/story-helpers";

const meta = {
  title: "Base Components/Page Content Container",
  component: PageContentContainer,
} satisfies Meta<typeof PageContentContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="rounded border border-dashed border-slate-300 py-6">
      <PageContentContainer>
        <SampleBlock label="Page title" />
        <SampleBlock label="Primary content area" />
      </PageContentContainer>
    </div>
  ),
};
