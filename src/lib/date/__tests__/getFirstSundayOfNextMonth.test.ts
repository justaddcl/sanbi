import { getFirstSundayOfNextMonth } from "@lib/date/getFirstSundayOfNextMonth";

describe("getFirstSundayOfNextMonth", () => {
  it("returns the first day of next month if it is a Sunday", () => {
    // Example: Given July 15, 2021, next month is August 2021.
    // August 1, 2021 was a Sunday.
    const inputDate = new Date(2021, 6, 15); // Months are 0-indexed: 6 = July
    const result = getFirstSundayOfNextMonth(inputDate);
    expect(result.getFullYear()).toBe(2021);
    expect(result.getMonth()).toBe(7); // 7 = August
    expect(result.getDate()).toBe(1);
    expect(result.getDay()).toBe(0); // Sunday
  });

  it("returns the first Sunday of next month when the first day is not Sunday", () => {
    // Example: Given September 10, 2021, next month is October 2021.
    // October 1, 2021 is a Friday (day 5), so (7 - 5) % 7 = 2 days later -> October 3, 2021.
    const inputDate = new Date(2021, 8, 10); // 8 = September
    const result = getFirstSundayOfNextMonth(inputDate);
    expect(result.getFullYear()).toBe(2021);
    expect(result.getMonth()).toBe(9); // 9 = October
    expect(result.getDate()).toBe(3);
    expect(result.getDay()).toBe(0);
  });

  it("handles end of year transition correctly", () => {
    // Example: Given December 25, 2021, next month is January 2022.
    // January 1, 2022 is a Saturday (day 6), so expected Sunday is January 2, 2022.
    const inputDate = new Date(2021, 11, 25); // 11 = December
    const result = getFirstSundayOfNextMonth(inputDate);
    expect(result.getFullYear()).toBe(2022);
    expect(result.getMonth()).toBe(0); // 0 = January
    expect(result.getDate()).toBe(2);
    expect(result.getDay()).toBe(0);
  });

  it("returns a valid Sunday for default input date (no argument)", () => {
    // When no argument is provided, the function should return the first Sunday of the next month.
    // We'll verify that the result is indeed in the next month and is a Sunday.
    const now = new Date();
    const result = getFirstSundayOfNextMonth();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    expect(result.getFullYear()).toBe(nextMonth.getFullYear());
    expect(result.getMonth()).toBe(nextMonth.getMonth());
    expect(result.getDay()).toBe(0); // Ensure it's a Sunday.
  });
});
