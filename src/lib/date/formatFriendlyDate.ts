import {
  differenceInCalendarWeeks,
  format,
  isToday,
  isTomorrow,
} from "date-fns";

export const formatFriendlyDate = (date: string) => {
  if (isToday(date)) {
    return "Today";
  }

  if (isTomorrow(date)) {
    return "Tomorrow";
  }

  const weekDiff = differenceInCalendarWeeks(date, new Date(), {
    weekStartsOn: 0,
  });
  if (weekDiff === 0) {
    return `This ${format(date, "EEEE")}`;
  }

  if (weekDiff === 1) {
    return `Next ${format(date, "EEEE")}`;
  }

  return format(date, "EEEE, MMM dd");
};
