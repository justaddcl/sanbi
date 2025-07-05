import {
  differenceInCalendarWeeks,
  format,
  isPast,
  isToday,
  isTomorrow,
  isYesterday,
} from "date-fns";

export const FRIENDLY_FORMAT_CALENDAR_WEEK_DIFFERENCE_THRESHOLD = 2;

export const MONTH_FULL_FORMAT = "MMMM";
export const MONTH_SHORT_FORMAT = "MMM";

export const DAY_OF_THE_MONTH_TWO_DIGIT_FORMAT = "dd";

export const DAY_OF_THE_WEEK_FULL_FORMAT = "EEEE";
export const DAY_OF_THE_WEEK_SHORT_FORMAT = "E";

export const FRIENDLY_DATE_DEFAULT_FORMAT = `${MONTH_FULL_FORMAT} ${DAY_OF_THE_MONTH_TWO_DIGIT_FORMAT} (${DAY_OF_THE_WEEK_SHORT_FORMAT})`;

export const formatFriendlyDate = (date: string) => {
  if (isToday(date)) {
    return "Today";
  }

  if (isTomorrow(date)) {
    return "Tomorrow";
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  const weekDiff = differenceInCalendarWeeks(date, new Date(), {
    weekStartsOn: 0,
  });

  if (weekDiff === 0) {
    return `This ${isPast(date) ? "past" : "coming"} ${format(date, DAY_OF_THE_WEEK_FULL_FORMAT)}`;
  }

  if (weekDiff === 1) {
    return `Next ${format(date, DAY_OF_THE_WEEK_FULL_FORMAT)}`;
  }

  if (weekDiff === -1) {
    return `Last ${format(date, DAY_OF_THE_WEEK_FULL_FORMAT)}`;
  }

  return format(date, FRIENDLY_DATE_DEFAULT_FORMAT);
};
