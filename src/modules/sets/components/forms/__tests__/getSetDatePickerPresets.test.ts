import { getSetDatePickerPresets } from "../getSetDatePickerPresets";

describe("getSetDatePickerPresets", () => {
  it("returns preset offsets from a weekday base date", () => {
    const baseDate = new Date(2026, 5, 2);

    expect(getSetDatePickerPresets(baseDate)).toEqual([
      {
        value: "5",
        label: "Upcoming Sunday",
      },
      {
        value: "12",
        label: "Sunday After Next",
      },
      {
        value: "33",
        label: "First Sunday of Next Month",
      },
    ]);
  });

  it("treats upcoming Sunday as the following Sunday when today is Sunday", () => {
    const baseDate = new Date(2026, 5, 7);

    expect(getSetDatePickerPresets(baseDate)).toEqual([
      {
        value: "7",
        label: "Upcoming Sunday",
      },
      {
        value: "14",
        label: "Sunday After Next",
      },
      {
        value: "28",
        label: "First Sunday of Next Month",
      },
    ]);
  });
});
