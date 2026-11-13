import { useNow } from "@vueuse/core";
import { useI18n } from "vue-i18n";

export function useTimeFormat() {
  const { d, locale } = useI18n();

  const now = useNow({ interval: 30_000 });
  function formatRelativeTime(date: string | number): string {
    const formatter = new Intl.RelativeTimeFormat(locale.value, {
      numeric: "auto",
    });

    const targetDate = typeof date === "string" ? Date.parse(date) : date;

    const diffInMilliseconds = now.value.getTime() - targetDate;
    const diffInMinutes = Math.round(diffInMilliseconds / 1000 / 60);

    const HOUR = 60;
    const DAY = HOUR * 24;

    if (diffInMinutes < HOUR) {
      return formatter.format(-diffInMinutes, "minute");
    }
    if (diffInMinutes < DAY) {
      return formatter.format(-Math.round(diffInMinutes / HOUR), "hour");
    }
    if (diffInMinutes < DAY * 2) {
      return formatter.format(-Math.round(diffInMinutes / DAY), "day");
    }
    return d(date, "full");
  }

  return {
    formatRelativeTime,
  };
}
