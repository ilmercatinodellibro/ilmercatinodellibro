<template>
  <q-item class="bg-white in-app-notification q-pa-md shadow-24 width-315">
    <q-btn
      class="close-button"
      round
      dense
      color="black"
      text-color="white"
      :icon="mdiClose"
      size="10px"
      padding="1px"
      @click="close"
    />

    <q-item-section>
      <q-item-label class="items-center no-wrap row">
        <span
          class="ellipsis letter-spacing-5 q-ml-xs text-black-87 text-size-12"
        >
          {{ formatRelativeTime(notification.event.createdAt) }}
        </span>
      </q-item-label>

      <q-item-label caption>
        {{ notification.event.description }}
      </q-item-label>

      <q-item-label class="gap-8 row">
        <q-btn :label="t('common.ok')" outline @click="close()" />
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { mdiClose } from "@quasar/extras/mdi-v7";
import { useI18n } from "vue-i18n";
import { useTimeFormat } from "src/composables/use-time-format";
import { useNotificationService } from "src/services/notification";
import { NotificationFragment } from "src/services/notification.graphql";

const props = defineProps<{
  notification: NotificationFragment;
}>();

const emit = defineEmits<{ close: [] }>();

const { t } = useI18n();

const { formatRelativeTime } = useTimeFormat();

const { markAsRead } = useNotificationService();

async function close() {
  await markAsRead(props.notification.id);
  emit("close");
}
</script>

<style scoped lang="scss">
.in-app-notification {
  border-radius: 20px;
}

.close-button {
  position: absolute;
  top: -3px;
  right: -3px;
}
</style>
