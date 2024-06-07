import { formatDate } from "@lib/date";

describe("FormatDate dates lib function", () => {
  it("should format the given date with short format in the 'en-US' locale with the default params", () => {
    const testDate = "2024-06-07";

    const result = formatDate(testDate);

    expect(result).toBe("Jun 07");
  });

  it("should format with the short format when passed the short `options.format` param", () => {
    const testDate = "2024-06-07";

    const result = formatDate(testDate, { format: "short" });

    expect(result).toBe("Jun 07");
  });

  it("should format with the long format when passed the long `options.format` param", () => {
    const testDate = "2024-06-07";

    const result = formatDate(testDate, { format: "long" });

    expect(result).toBe("June 07, 2024");
  });

  it("should respect the passed in formatting options", () => {
    const testDate = "2024-06-07";

    const result = formatDate(testDate, {
      weekday: "long",
      month: "numeric",
      day: "numeric",
      year: "2-digit",
      locale: "no-GB",
    });

    expect(result).toBe("fredag 7.6.24");
  });
});
