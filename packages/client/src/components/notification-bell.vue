<template>
  <q-btn
    flat
    round
    dense
    :loading="isLoading"
    :disable="!isSupported"
    :icon="isSubscribed ? mdiBellRing : mdiBellOff"
    @click="toggleSubscription"
  >
    <q-tooltip>
      <span>{{ tooltip }}</span>
    </q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import {
  mdiBellAlert,
  mdiBellCancel,
  mdiBellOff,
  mdiBellRing,
} from "@quasar/extras/mdi-v7";
import { useStorage, useSupported, useVibrate } from "@vueuse/core";
import {
  deleteToken,
  getToken,
  isSupported as isFcmSupported,
} from "firebase/messaging";
import { Dialog, Notify } from "quasar";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useFirebaseMessaging } from "src/boot/firebase-messaging";
import { usePushNotificationService } from "src/services/push-notification";
import NotificationPermissionInfoDialog from "./notification-permission-info-dialog.vue";

const messaging = useFirebaseMessaging();
// useSupported is SSR friendly, that's why we use it instead of using what's inside the callback directly
const isSupported = useSupported(() => isFcmSupported());
const isSubscribed = ref(false);
const isLoading = ref(false);
const token = useStorage<string | null>(
  "notification-subscription-token",
  null,
);

const { subscribe: sendTokenToServer, unsubscribe: removeTokenFromServer } =
  usePushNotificationService();

// The device token may have been invalidated by FCM server
// There is no way to detect that, so we try to get a new one and compare it with local storage
// This way, we ensure our server always has the latest token
onMounted(async () => {
  if (!isSupported.value || Notification.permission !== "granted") {
    return;
  }

  try {
    isLoading.value = true;
    await checkToken();
    isSubscribed.value = true;
  } catch {
    isSubscribed.value = false;
  } finally {
    isLoading.value = false;
  }
});

const { t } = useI18n();

const tooltip = computed(() => {
  if (!isSupported.value) {
    return t("pushNotifications.unsupported");
  }

  if (isLoading.value) {
    return isSubscribed.value
      ? t("pushNotifications.unsubscribing")
      : t("pushNotifications.subscribing");
  }

  return isSubscribed.value
    ? t("pushNotifications.unsubscribe")
    : t("pushNotifications.subscribe");
});

const { vibrate } = useVibrate({ interval: 500 });
async function toggleSubscription() {
  isLoading.value = true;

  const isSubscribing = !isSubscribed.value;

  try {
    if (isSubscribing) {
      await subscribe();
    } else {
      await unsubscribe();
    }
  } catch (error) {
    console.error(error);
    Notify.create({
      group: "notifications",
      type: "negative",
      message: isSubscribing
        ? t("pushNotifications.subscribeError")
        : t("pushNotifications.unsubscribeError"),
      icon: mdiBellAlert,
    });
  } finally {
    isLoading.value = false;
    vibrate();
  }
}

async function openPermissionInfoDialog() {
  return new Promise<boolean>((resolve) => {
    Dialog.create({
      component: NotificationPermissionInfoDialog,
    })
      .onOk(() => {
        resolve(true);
      })
      .onCancel(() => {
        resolve(false);
      });
  });
}

const notifyPermissionDenied = () =>
  Notify.create({
    group: "notifications",
    type: "negative",
    message: t("pushNotifications.permissionDenied"),
    icon: mdiBellCancel,
  });

async function requestPermission() {
  const shouldRequestPermission = await openPermissionInfoDialog();
  if (!shouldRequestPermission) {
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    notifyPermissionDenied();
    return false;
  }

  return true;
}

async function subscribe() {
  // It was previously denied, so we can't request permission again
  if (Notification.permission === "denied") {
    notifyPermissionDenied();
    // TODO: Show a dialog explaining how to allow notifications in browser settings
    return;
  }

  if (Notification.permission === "default") {
    const isGranted = await requestPermission();
    if (!isGranted) {
      return;
    }
  }

  await checkToken();

  isSubscribed.value = true;
  Notify.create({
    group: "notifications",
    type: "positive",
    message: t("pushNotifications.subscribeSuccess"),
    icon: mdiBellRing,
  });
}

async function checkToken() {
  const oldToken = token.value;
  const newToken = await getToken(messaging, {
    vapidKey: process.env.WEB_PUSH_VAPID_KEY,
    serviceWorkerRegistration: await navigator.serviceWorker.getRegistration(),
  });
  if (oldToken !== newToken) {
    await sendTokenToServer(newToken);

    if (oldToken !== null) {
      await removeTokenFromServer(oldToken);
    }
  }
  token.value = newToken;
}

async function unsubscribe() {
  await deleteToken(messaging);

  if (token.value !== null) {
    await removeTokenFromServer(token.value);
  }
  token.value = null;

  Notify.create({
    group: "notifications",
    type: "positive",
    message: t("pushNotifications.unsubscribeSuccess"),
    icon: mdiBellOff,
  });
  isSubscribed.value = false;
}
</script>
