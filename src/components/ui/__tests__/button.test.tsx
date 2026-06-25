import type React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { Button } from "../button";

describe("Button", () => {
  it("defaults to non-submit behavior inside forms", () => {
    const onSubmit = jest.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });

    render(
      <form onSubmit={onSubmit}>
        <Button>Open menu</Button>
      </form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("preserves explicit submit behavior", () => {
    const onSubmit = jest.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });

    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Save</Button>
      </form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not add button-only attributes to slotted links", () => {
    render(
      <Button asChild>
        <a href="https://example.com/sets">View sets</a>
      </Button>,
    );

    expect(screen.getByRole("link", { name: "View sets" })).not.toHaveAttribute(
      "type",
    );
  });
});
