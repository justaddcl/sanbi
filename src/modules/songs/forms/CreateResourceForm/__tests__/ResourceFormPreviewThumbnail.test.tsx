import { render } from "@testing-library/react";

import { ResourceFormPreviewThumbnail } from "../ResourceFormPreviewThumbnail";

describe("ResourceFormPreviewThumbnail", () => {
  it("renders a fallback icon when no image is available", () => {
    const { container } = render(
      <ResourceFormPreviewThumbnail imageUrl={null} />,
    );

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders the preview image when an image URL is available", () => {
    const imageUrl = "https://example.com/preview.jpg";
    const { container } = render(
      <ResourceFormPreviewThumbnail imageUrl={imageUrl} />,
    );

    expect(container.querySelector("img")).toHaveAttribute("src", imageUrl);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
