import { render, screen } from "@testing-library/react";

import { ResourceFormPreviewThumbnail } from "../ResourceFormPreviewThumbnail";

describe("ResourceFormPreviewThumbnail", () => {
  it("renders a fallback icon when no image is available", () => {
    render(<ResourceFormPreviewThumbnail imageUrl={null} />);

    expect(
      screen.queryByRole("presentation", { hidden: true }),
    ).not.toBeInTheDocument();
  });

  it("renders the preview image when an image URL is available", () => {
    const imageUrl = "https://example.com/preview.jpg";
    render(<ResourceFormPreviewThumbnail imageUrl={imageUrl} />);

    expect(
      screen.getByRole("presentation", { hidden: true }),
    ).toHaveAttribute("src", imageUrl);
  });
});
