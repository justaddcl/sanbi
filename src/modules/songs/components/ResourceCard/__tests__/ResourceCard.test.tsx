import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { getDisplayUrl } from "@modules/songs/utils/getDisplayUrl";
import { createResourceFixture } from "@/testUtils/models/resource/fixtures";

import { ResourceCard } from "../ResourceCard";

describe("ResourceCard", () => {
  it("keeps the external link and edit action as separate targets", async () => {
    const resource = createResourceFixture();
    const onEdit = jest.fn();

    render(<ResourceCard resource={resource} onEdit={onEdit} />);

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
});
