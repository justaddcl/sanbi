import { format } from "date-fns";

import { formatFriendlyDate } from "@lib/date";

describe("formatFriendlyDate", () => {
  // Freeze system time to June 24, 2025
  beforeAll(() => {
    jest.useFakeTimers({ legacyFakeTimers: false });
    jest.setSystemTime(new Date("2025-06-24T12:00:00Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('returns "Today" for the current date', () => {
    expect(formatFriendlyDate("2025-06-24")).toBe("Today");
  });

  it('returns "Tomorrow" for the next day', () => {
    expect(formatFriendlyDate("2025-06-25")).toBe("Tomorrow");
  });

  it('returns "This <weekday>" for other days in the same week', () => {
    // June 26 2025 is a Thursday in the same calendar week (week starts on Sunday)
    const target = "2025-06-26";
    const expected = `This ${format(new Date(target), "EEEE")}`; // This Thursday
    expect(formatFriendlyDate(target)).toBe(expected);
  });

  it('returns "Next <weekday>" for dates in the next week', () => {
    // June 29 2025 is Sunday of the next calendar week
    const target = "2025-06-29";
    const expected = `Next ${format(new Date(target), "EEEE")}`;
    expect(formatFriendlyDate(target)).toBe(expected); // Next Sunday
  });

  it('returns "This <weekday>" for yesterday within the same week', () => {
    // June 23 2025 is Monday, yesterday relative to June 24 2025
    const target = "2025-06-23";
    const expected = `This ${format(new Date(target), "EEEE")}`; // This Monday
    expect(formatFriendlyDate(target)).toBe(expected);
  });

  it("formats dates beyond next week using default format", () => {
    const target = "2025-07-08";
    const expected = format(new Date(target), "EEEE, MMM dd"); // Tuesday, Jul 08
    expect(formatFriendlyDate(target)).toBe(expected);
  });

  it("formats past dates beyond a week ago using default format", () => {
    const target = "2025-06-16";
    const expected = format(new Date(target), "EEEE, MMM dd"); // Monday, Jun 16
    expect(formatFriendlyDate(target)).toBe(expected);
  });
});
