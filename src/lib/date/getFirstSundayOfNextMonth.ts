import { addDays, addMonths, getDay, startOfMonth } from "date-fns";

export const getFirstSundayOfNextMonth = (fromDate = new Date()) => {
  const firstDayOfNextMonth = startOfMonth(addMonths(fromDate, 1));
  const dayOfWeek = getDay(firstDayOfNextMonth);

  const daysUntilSunday = (7 - dayOfWeek) % 7;
  return addDays(firstDayOfNextMonth, daysUntilSunday);
};
