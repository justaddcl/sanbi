import { type ComponentProps } from "react";
import * as Sentry from "@sentry/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createResourceFixture } from "@testUtils/models/resource/fixtures";
import { createResourceName } from "@testUtils/models/resource/generators";

import { getDisplayUrl } from "@modules/songs/utils/getDisplayUrl";

import { ResourceCard } from "../ResourceCard";

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

jest.mock(
  "@lib/orpc/client",
  () => ({
    orpc: {
      resource: {
        delete: {
          mutationOptions: () => ({
            mutationFn: jest.fn(),
          }),
        },
        getBySongId: {
          queryOptions: ({ input }: { input: unknown }) => ({
            queryKey: ["orpc", "resource", "getBySongId", input],
          }),
        },
      },
    },
  }),
  { virtual: true },
);

const renderResourceCard = (props: ComponentProps<typeof ResourceCard>) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <ResourceCard {...props} />
    </QueryClientProvider>,
  );
};

describe("ResourceCard", () => {
  const songName = createResourceName();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("keeps the external link and edit action as separate targets", async () => {
    const resource = createResourceFixture();
    const onEdit = jest.fn();

    renderResourceCard({ resource, songName, onEdit });

    const resourceLink = screen.getByRole("link", {
      name: new RegExp(resource.title, "i"),
    });

    expect(resourceLink).toHaveAttribute("href", resource.url);
    expect(resourceLink).toHaveTextContent(getDisplayUrl(resource.url));

    fireEvent.keyDown(
      screen.getByRole("button", {
        name: `Open actions for ${resource.title}`,
      }),
      { key: "Enter", code: "Enter" },
    );

    const editResourceAction = await screen.findByText("Edit resource");
    fireEvent.click(editResourceAction);

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith(resource);
    });
  });

  it("redacts invalid resource URLs before reporting parse failures", () => {
    const resource = createResourceFixture({
      url: "not a url with token=secret",
    });

    renderResourceCard({ resource, songName, onEdit: jest.fn() });

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "Failed to parse resource URL",
      {
        level: "warning",
        extra: {
          url: "[invalid-url]",
          error: "TypeError",
        },
      },
    );
  });

  it("does not show a warning opt-out when the preference cannot be persisted", async () => {
    const resource = createResourceFixture();

    renderResourceCard({ resource, songName, onEdit: jest.fn() });

    fireEvent.keyDown(
      screen.getByRole("button", {
        name: `Open actions for ${resource.title}`,
      }),
      { key: "Enter", code: "Enter" },
    );
    fireEvent.click(await screen.findByText("Unlink resource"));

    expect(
      await screen.findByRole("heading", {
        name: `Unlink ${resource.title}`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Don't warn me again"),
    ).not.toBeInTheDocument();
  });
});
