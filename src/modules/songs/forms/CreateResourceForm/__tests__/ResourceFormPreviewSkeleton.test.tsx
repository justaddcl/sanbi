import { render, screen } from "@testing-library/react";

import { ResourceFormPreviewSkeleton } from "../ResourceFormPreviewSkeleton";

describe("ResourceFormPreviewSkeleton", () => {
  it("announces that the preview is loading", () => {
    render(<ResourceFormPreviewSkeleton />);

    expect(
      screen.getByRole("status", { name: "Loading resource preview" }),
    ).toBeInTheDocument();
  });
});
