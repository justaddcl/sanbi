import { format } from "date-fns";

import {
  DAY_OF_THE_WEEK_FULL_FORMAT,
  formatFriendlyDate,
  FRIENDLY_DATE_DEFAULT_FORMAT,
} from "@lib/date";

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

  it('returns "Yesterday" for the previous day', () => {
    expect(formatFriendlyDate("2025-06-23")).toBe("Yesterday");
  });

  it('returns "This coming <weekday>" for future days in the same week', () => {
    const target = "2025-06-26";
    const expected = `This coming ${format(new Date(target), DAY_OF_THE_WEEK_FULL_FORMAT)}`; // This coming Thursday
    expect(formatFriendlyDate(target)).toBe(expected);
  });

  it('returns "This past <weekday>" for past days in the same week', () => {
    const target = "2025-06-22";
    const expected = `This past ${format(new Date(target), DAY_OF_THE_WEEK_FULL_FORMAT)}`; // This past Sunday
    expect(formatFriendlyDate(target)).toBe(expected);
  });

  it('returns "Next <weekday>" for dates in the next week', () => {
    // June 29 2025 is Sunday of the next calendar week
    const target = "2025-06-29";
    const expected = `Next ${format(new Date(target), DAY_OF_THE_WEEK_FULL_FORMAT)}`;
    expect(formatFriendlyDate(target)).toBe(expected); // Next Sunday
  });

  it('formats "Last <weekday>" for dates in the previous week', () => {
    const target = "2025-06-16";
    const expected = `Last ${format(new Date(target), DAY_OF_THE_WEEK_FULL_FORMAT)}`; // Last Monday
    expect(formatFriendlyDate(target)).toBe(expected);
  });

  it("formats dates beyond next week using default format", () => {
    const target = "2025-07-08";
    const expected = format(new Date(target), FRIENDLY_DATE_DEFAULT_FORMAT); // Jul 08 (Tuesday)
    expect(formatFriendlyDate(target)).toBe(expected);
  });

  it("formats dates before last week using default format", () => {
    const target = "2025-05-01";
    const expected = format(new Date(target), FRIENDLY_DATE_DEFAULT_FORMAT); // May 01 (Friday)
    expect(formatFriendlyDate(target)).toBe(expected);
  });
});
