import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { DatePicker } from "../datePicker";

describe("DatePicker", () => {
  it("clears the selected date and restores focus to the trigger", async () => {
    const onChange = jest.fn();

    render(
      <DatePicker
        date={new Date("2026-06-02T12:00:00.000Z")}
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole("button", { name: /Jun/ });
    const clearButton = screen.getByRole("button", { name: "Clear date" });

    fireEvent.click(clearButton);

    expect(onChange).toHaveBeenCalledWith(undefined);
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });
});
