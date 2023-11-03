<template>
  <q-table
    :rows="notifications"
    :columns="columns"
    hide-header
    dense
    flat
    :pagination="{ rowsPerPage: 50 }"
    :rows-per-page-options="[]"
    :loading="loading"
    :filter="combinedFilter"
    :filter-method="filterMethod"
    :no-data-label="t('events.manager.noEvents')"
    :no-results-label="t('events.manager.noEventsMatched')"
    class="event-table"
  >
    <template #top>
      <div class="flex full-width gap-16 justify-end">
        <date-selector
          v-model="dateFilter"
          :label="t('common.filterBy', { field: t('common.date') })"
          outlined
          dense
          class="min-width-200"
        />

        <q-input
          v-model="textFilter"
          :label="t('common.search')"
          outlined
          dense
        >
          <template #append>
            <q-icon :name="mdiMagnify" />
          </template>
        </q-input>
      </div>
    </template>

    <template #body-cell-details="scope: BodyCellNameScope<EventFragment>">
      <q-td :props="scope">
        <q-item dense>
          <q-item-section>
            <q-item-label>
              {{ formatRelativeTime(scope.value.createdAt) }}
            </q-item-label>

            <q-item-label
              caption
              class="letter-spacing-5 line-height-16 text-size-12"
            >
              {{ scope.value.description }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-td>
    </template>

    <template
      #body-cell-status-last-change="scope: BodyCellNameScope<EventFragment>"
    >
      <q-td :props="scope">
        <q-icon :name="mdiAccount" color="black-54" size="28px">
          <q-tooltip>
            {{
              t("events.owner", {
                person:
                  scope.value.owner.firstname +
                  " " +
                  scope.value.owner.lastname,
              })
            }}
          </q-tooltip>
        </q-icon>
      </q-td>
    </template>

    <template #body-cell-read="scope: BodyCellNameScope<boolean>">
      <q-td :props="scope" :data-read="scope.value">
        <q-btn
          flat
          round
          dense
          :icon="scope.value ? mdiMessageCheck : mdiMessageBadge"
          :color="scope.value ? 'black-54' : 'black-87'"
          size="16px"
          @click="
            scope.value ? markAsUnread(scope.row.id) : markAsRead(scope.row.id)
          "
        >
          <q-tooltip>
            {{
              scope.value
                ? t("events.actionMenu.markAsUnread")
                : t("events.actionMenu.markAsRead")
            }}
          </q-tooltip>
        </q-btn>
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import {
  mdiAccount,
  mdiMagnify,
  mdiMessageBadge,
  mdiMessageCheck,
} from "@quasar/extras/mdi-v7";
import { QTableColumn, QTableProps, QTableSlots } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useTimeFormat } from "src/composables/use-time-format";
import { EventFragment } from "src/services/event.graphql";
import { useNotificationService } from "src/services/notification";
import { NotificationFragment } from "src/services/notification.graphql";
import DateSelector from "../date-selector.vue";
import { useNotificationFilters } from "./notification-filters";

defineProps<{
  notifications: NotificationFragment[];
  loading?: boolean;
}>();

const {
  textFilter,
  applyTextFilter,

  dateFilter,
  applyDateFilter,
} = useNotificationFilters();

// For letting q-table know that the filter has changed so it can call the filter method
const combinedFilter = computed(() => {
  const filter = {
    searchText: textFilter.value,
    date: dateFilter.value,
  };

  return filter.searchText === "" && filter.date === undefined
    ? undefined
    : filter;
});
const filterMethod: QTableProps["filterMethod"] = (
  rows: readonly NotificationFragment[],
  filter: NonNullable<typeof combinedFilter.value>,
) => {
  return rows.filter(
    (notification) =>
      applyTextFilter(notification, filter.searchText) &&
      applyDateFilter(notification, filter.date),
  );
};

const { markAsRead, markAsUnread } = useNotificationService();

const { t } = useI18n();

const { formatRelativeTime } = useTimeFormat();

// This is an unusual table, so the columns definition is a bit unusual too.
// We set `label` as empty since they will not be displayed.
// We set `field` to act as a shortcut when accessing the data through `scope.value`
const columns: QTableColumn<NotificationFragment>[] = [
  {
    name: "details",
    field: "event",
    label: "",
    align: "left",
  },
  {
    name: "status-last-change",
    field: "event",
    label: "",
  },
  {
    name: "read",
    field: (row) => row.readAt !== null && row.readAt !== undefined,
    label: "",
    classes: "width-32",
  },
];
type BaseBodyCellNameScope = Parameters<QTableSlots[`body-cell-${string}`]>[0];
interface BodyCellNameScope<T> extends BaseBodyCellNameScope {
  row: NotificationFragment;
  value: T;
}
</script>

<style lang="scss" scoped>
.event-table :deep(.q-table tbody tr:has([data-read="true"])) {
  background-color: $grey-3;
}
</style>
