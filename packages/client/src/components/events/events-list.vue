<template>
  <div v-if="loading" class="fit flex flex-center">
    <q-spinner size="xl" />
  </div>
  <q-list v-else separator bordered class="column" v-bind="$attrs">
    <div
      v-if="notifications.length === 0"
      class="col flex flex-center full-width text-size-20"
    >
      {{ t("events.manager.noEvents") }}
    </div>
    <div
      v-else-if="filteredNotifications.length === 0"
      class="col flex flex-center full-width text-size-20"
    >
      {{ t("events.manager.noEventsMatched") }}
    </div>

    <q-item
      v-for="{ id, readAt, event } in filteredNotifications"
      :key="id"
      :class="readAt ? 'bg-grey-3' : ''"
    >
      <q-item-section>
        <q-item-label>
          <q-icon
            :name="readAt ? mdiMessageCheck : mdiMessageBadge"
            :color="readAt ? 'grey' : 'primary'"
            size="16px"
            class="q-ml-none"
          />
        </q-item-label>

        <q-item-label
          class="letter-spacing-15 line-height-16 text-black-87 text-size-10"
        >
          {{ formatRelativeTime(event.createdAt) }}
        </q-item-label>

        <q-item-label
          caption
          class="letter-spacing-5 line-height-16 text-size-12"
        >
          {{ event.description }}
        </q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-btn round flat dense :icon="mdiDotsVertical">
          <q-menu auto-close>
            <q-list>
              <q-item
                clickable
                @click="readAt ? markAsUnread(id) : markAsRead(id)"
              >
                <q-item-section>
                  {{
                    readAt
                      ? t("events.actionMenu.markAsUnread")
                      : t("events.actionMenu.markAsRead")
                  }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import {
  mdiDotsVertical,
  mdiMessageBadge,
  mdiMessageCheck,
} from "@quasar/extras/mdi-v7";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useTimeFormat } from "src/composables/use-time-format";
import { useNotificationService } from "src/services/notification";
import { NotificationFragment } from "src/services/notification.graphql";
import { useNotificationFilters } from "./notification-filters";

const props = defineProps<{
  notifications: NotificationFragment[];
  loading?: boolean;
}>();

defineOptions({
  inheritAttrs: false,
});

const { textFilter, applyTextFilter } = useNotificationFilters();

const filteredNotifications = computed(() => {
  if (textFilter.value === "") {
    return props.notifications;
  }

  return props.notifications.filter((notification) => {
    return applyTextFilter(notification, textFilter.value);
  });
});

const { markAsRead, markAsUnread } = useNotificationService();

const { t } = useI18n();

const { formatRelativeTime } = useTimeFormat();
</script>
