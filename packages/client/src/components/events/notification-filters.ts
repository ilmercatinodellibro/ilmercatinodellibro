import { syncRef } from "@vueuse/core";
import { date } from "quasar";
import { ref } from "vue";
import { useHeaderSearch } from "src/composables/header-features/use-header-search";
import { NotificationFragment } from "src/services/notification.graphql";

const { formatDate } = date;

export function useNotificationFilters() {
  const textFilter = ref("");
  try {
    const { searchText } = useHeaderSearch();
    syncRef(textFilter, searchText);
  } catch {
    // do nothing
  }

  const dateFilter = ref<DateFilter>();

  return {
    textFilter,
    applyTextFilter,

    dateFilter,
    applyDateFilter,
  };
}

const applyTextFilter = ({ event }: NotificationFragment, filter: string) => {
  if (filter.length === 0) {
    return true;
  }

  const searchableFields = [event.name, event.description];

  return searchableFields.some((field) =>
    field.toLowerCase().includes(filter.toLowerCase()),
  );
};

export type DateFilter = { from: string; to: string } | undefined;
const applyDateFilter = (row: NotificationFragment, filter: DateFilter) => {
  if (filter === undefined) {
    return true;
  }

  const createdAt = formatDate(new Date(row.event.createdAt), "YYYY/MM/DD");

  return createdAt >= filter.from && createdAt <= filter.to;
};
