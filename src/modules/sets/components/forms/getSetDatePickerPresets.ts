import { addWeeks, differenceInCalendarDays, nextSunday } from "date-fns";

import { type DatePickerPreset } from "@components/ui/datePicker";
import { getFirstSundayOfNextMonth } from "@lib/date/getFirstSundayOfNextMonth";

export const getSetDatePickerPresets = (
  baseDate = new Date(),
): DatePickerPreset[] => {
  const upcomingSunday = nextSunday(baseDate);
  const sundayAfterNext = addWeeks(upcomingSunday, 1);
  const firstSundayOfNextMonth = getFirstSundayOfNextMonth(baseDate);

  return [
    {
      value: `${differenceInCalendarDays(upcomingSunday, baseDate)}`,
      label: "Upcoming Sunday",
    },
    {
      value: `${differenceInCalendarDays(sundayAfterNext, baseDate)}`,
      label: "Sunday After Next",
    },
    {
      value: `${differenceInCalendarDays(firstSundayOfNextMonth, baseDate)}`,
      label: "First Sunday of Next Month",
    },
  ];
};
