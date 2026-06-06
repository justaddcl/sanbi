import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PageContentContainer } from "./PageContentContainer";

const SampleBlock = ({ label }: { label: string }) => (
  <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
    {label}
  </div>
);

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
