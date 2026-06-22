import { render, screen } from "@testing-library/react";

import { HighlightedText } from "../HighlightedText";

describe("HighlightedText", () => {
  it("highlights matching text without changing unmatched text", () => {
    render(<HighlightedText query="grace" text="Amazing Grace" />);

    expect(screen.getByText("Grace").tagName).toBe("MARK");
    expect(screen.getByText("Amazing")).toBeInTheDocument();
  });

  it("returns plain text when the query is blank", () => {
    render(<HighlightedText query=" " text="Amazing Grace" />);

    expect(screen.getByText("Amazing Grace")).toBeInTheDocument();
    expect(screen.queryByText("Amazing Grace")?.tagName).not.toBe("MARK");
  });

  it("highlights the closest word when there is no exact match", () => {
    render(
      <HighlightedText
        highlightWhenNoExactMatch
        query="amazng"
        text="Amazing Grace"
      />,
    );

    expect(screen.getByText("Amazing").tagName).toBe("MARK");
    expect(screen.getByText("Grace").tagName).not.toBe("MARK");
  });
});
