import { capitalize } from "lodash-es";
import { date } from "quasar";

export interface MainDuration {
  quantity: number;
  unitOfMeasure: MacroIntervalDurationNames;
}

export interface IntervalDuration {
  date: {
    years: number;
    months: number;
    days: number;
  };
  time: {
    hours: number;
    minutes: number;
  };
}

export interface QuickRange {
  name: AvailableQuickRanges;
  macroIntervalName: MacroIntervalDurationNames;
  previous: boolean;
}

export const DATE_FORMAT = "YYYY-MM-DD";

export const Days = Object.freeze([
  "domenica",
  "lunedi",
  "martedi",
  "mercoledi",
  "giovedi",
  "venerdi",
  "sabato",
]);
// Sunday is day 0 on qdate standards
export const SUNDAY_INDEX = 0;

export const Months = Object.freeze([
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
]);

export enum MacroIntervalDurationNames {
  DAY = "DAY",
  WEEK = "WEEK",
  MONTH = "MONTH",
  YEAR = "YEAR",
}

export enum AdditionalMacroIntervalDurationNames {
  Custom = "CUSTOM",
}

export enum AvailableQuickRanges {
  Today = "today",
  ThisWeek = "thisWeek",
  ThisMonth = "thisMonth",
  ThisYear = "thisYear",

  Yesterday = "yesterday",
  LastWeek = "lastWeek",
  LastMonth = "lastMonth",
  LastYear = "lastYear",
}

export function getChipsFromMacroName(macroName: MacroIntervalDurationNames) {
  switch (macroName) {
    case MacroIntervalDurationNames.DAY: {
      return [7, 14, 30, 60, 120, 365];
    }
    case MacroIntervalDurationNames.WEEK: {
      return [2, 4, 8, 12];
    }
    case MacroIntervalDurationNames.MONTH: {
      return [2, 4, 8, 12, 24];
    }
    case MacroIntervalDurationNames.YEAR: {
      return [2, 4, 8, 12, 18];
    }
    default: {
      return [];
    }
  }
}

// Mainly used for q-calendar translation and abbreviations
export const CalendarLocale = Object.freeze({
  days: Days.map((day) => capitalize(day)),
  daysShort: Days.map((day) => capitalize(day.slice(0, 3))),
  months: Months.map((month) => capitalize(month)),
  monthsShort: Months.map((month) => capitalize(month.slice(0, 3))),
});

// Used to force the end date on the respective sunday on 'week' mode
export function forceSunday(dateToCheck: Date) {
  const daysOffset = (7 - dateToCheck.getDay()) % 7;
  dateToCheck.setDate(dateToCheck.getDate() + daysOffset);
  return date.formatDate(dateToCheck, DATE_FORMAT);
}

// Helper function that change the end date based on the passed unitOfMeasure
export function fixToDuration(
  dateToFix: Date,
  unitOfMeasure: MacroIntervalDurationNames,
) {
  let fixedDate: Date;
  switch (unitOfMeasure) {
    case MacroIntervalDurationNames.DAY: {
      fixedDate = new Date(dateToFix);
      break;
    }
    case MacroIntervalDurationNames.WEEK: {
      fixedDate = new Date(forceSunday(dateToFix));
      break;
    }
    case MacroIntervalDurationNames.MONTH: {
      fixedDate = new Date(dateToFix);
      // We must set the day as 1 before changing the month otherwise if the current day is greater then the maximum day of the next month
      // will automatically manage that error skipping that month to the next one
      fixedDate.setDate(1);
      fixedDate.setMonth(fixedDate.getMonth() + 1);
      fixedDate.setDate(0);
      break;
    }
    case MacroIntervalDurationNames.YEAR: {
      fixedDate = new Date(dateToFix.getFullYear(), 11, 31);
      break;
    }
    default:
      fixedDate = new Date(dateToFix);
  }
  return date.formatDate(fixedDate, DATE_FORMAT);
}

// Helper function used to calc the start date based on the end date and the duration
export function getStartDate(toDate: string, mainDuration: MainDuration) {
  const dateTo = new Date(toDate);
  let dateFrom = new Date(toDate);

  switch (mainDuration.unitOfMeasure) {
    case MacroIntervalDurationNames.DAY: {
      dateFrom.setDate(dateTo.getDate() - (mainDuration.quantity - 1));
      break;
    }
    case MacroIntervalDurationNames.WEEK: {
      dateFrom.setDate(dateTo.getDate() - (7 * mainDuration.quantity - 1));
      break;
    }
    case MacroIntervalDurationNames.MONTH: {
      dateFrom.setMonth(dateTo.getMonth() - (mainDuration.quantity - 1));
      dateFrom.setDate(1);
      break;
    }
    case MacroIntervalDurationNames.YEAR: {
      dateFrom = new Date(
        dateTo.getFullYear() - (mainDuration.quantity - 1),
        0,
        1,
      );
      break;
    }
    default: {
      throw new Error("L'intervallo selezionato non è valido.");
    }
  }
  return date.formatDate(dateFrom, DATE_FORMAT);
}

export const QUICK_RANGES: readonly QuickRange[] = Object.freeze([
  {
    name: AvailableQuickRanges.Today,
    macroIntervalName: MacroIntervalDurationNames.DAY,
    previous: false,
  },
  {
    name: AvailableQuickRanges.Yesterday,
    macroIntervalName: MacroIntervalDurationNames.DAY,
    previous: true,
  },
  {
    name: AvailableQuickRanges.ThisWeek,
    macroIntervalName: MacroIntervalDurationNames.WEEK,
    previous: false,
  },
  {
    name: AvailableQuickRanges.LastWeek,
    macroIntervalName: MacroIntervalDurationNames.WEEK,
    previous: true,
  },
  {
    name: AvailableQuickRanges.ThisMonth,
    macroIntervalName: MacroIntervalDurationNames.MONTH,
    previous: false,
  },
  {
    name: AvailableQuickRanges.LastMonth,
    macroIntervalName: MacroIntervalDurationNames.MONTH,
    previous: true,
  },
  {
    name: AvailableQuickRanges.ThisYear,
    macroIntervalName: MacroIntervalDurationNames.YEAR,
    previous: false,
  },
  {
    name: AvailableQuickRanges.LastYear,
    macroIntervalName: MacroIntervalDurationNames.YEAR,
    previous: true,
  },
]);

// Helper function used to calculate the end date based on the passed quick-range
export function getToDateFromQuickRanges(
  macroIntervalName: MacroIntervalDurationNames,
  previous: boolean,
) {
  let finalDate = new Date(Date.now());
  switch (macroIntervalName) {
    case MacroIntervalDurationNames.DAY: {
      if (previous) {
        finalDate.setDate(finalDate.getDate() - 1);
      }
      break;
    }
    case MacroIntervalDurationNames.WEEK: {
      if (previous) {
        finalDate.setDate(finalDate.getDate() - 7);
      }
      finalDate = new Date(forceSunday(finalDate));
      break;
    }
    case MacroIntervalDurationNames.MONTH: {
      finalDate = new Date(
        finalDate.getFullYear(),
        finalDate.getMonth() + (previous ? 0 : 1),
        0,
      );
      break;
    }
    case MacroIntervalDurationNames.YEAR: {
      finalDate = new Date(finalDate.getFullYear() + (previous ? 0 : 1), 0, 0);
      break;
    }
  }
  return date.formatDate(finalDate, DATE_FORMAT);
}

// Simple helper that find the respective quick range based on previous and new unit of measure
export function changeQuickRange(
  quickRange: QuickRange,
  newMacroName: MacroIntervalDurationNames,
) {
  return QUICK_RANGES.find(
    (quickRangeToCompare) =>
      quickRangeToCompare.macroIntervalName === newMacroName &&
      quickRangeToCompare.previous === quickRange.previous,
  );
}
