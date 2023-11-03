import {
  createEventHook,
  createSharedComposable,
  until,
  useStorage,
} from "@vueuse/core";
import { Ref, computed, watch } from "vue";
import { useInAppNotifications } from "src/composables/in-app-notifications";
import {
  NewNotificationDocument,
  NotificationFragment,
  useGetNotificationsQuery,
  useSetNotificationReadStatusMutation,
} from "./notification.graphql";

const newNotificationHook = createEventHook<NotificationFragment>();

// We don't need to re-create this composable every time we use it due to its structure.
// If that situation changes, we can change it back to a normal composable and apply related changes if necessary.
// So, we make it a shared composable for better performance and predictability.
export const useNotificationService = createSharedComposable(() => {
  const { notifications, loading, error, subscribeToMore } =
    useGetNotificationsQuery();

  // TODO: decide which notifications to show
  const { /*showInAppNotification, */ showInitialInAppNotifications } =
    useInAppEventsDisplay(notifications);

  // We need to restore ids from the local storage and match them with the notifications, so we have to wait until they are loaded.
  void until(loading)
    .toBe(false)
    .then(() => {
      showInitialInAppNotifications();
    });

  subscribeToMore({
    document: NewNotificationDocument,
    updateQuery: (existingData, { subscriptionData }) => {
      const { newNotification } = subscriptionData.data;

      void newNotificationHook.trigger(newNotification);

      return {
        ...existingData,
        notifications: [
          newNotification,
          // Make sure we don't have duplicates. It could happen due to race conditions.
          ...existingData.notifications.filter(
            ({ id }) => id !== newNotification.id,
          ),
        ],
      };
    },
  });

  const unreadNotificationsCount = computed(
    () => notifications.value.filter(({ readAt }) => !readAt).length,
  );

  const { setNotificationReadStatus } = useSetNotificationReadStatusMutation();
  async function markAsRead(id: string) {
    await setNotificationReadStatus({
      input: {
        id,
        read: true,
      },
    });
  }
  async function markAsUnread(id: string) {
    await setNotificationReadStatus({
      input: {
        id,
        read: false,
      },
    });
  }

  return {
    notifications,
    loading,
    error,
    newNotificationHook,

    unreadNotificationsCount,
    markAsRead,
    markAsUnread,
  };
});

/**
 * Events are displayed in the app in two ways:
 *  - Fatal events are displayed as a persistent dialog.
 *  - Error and Warning events are displayed as an in-app notification.
 *
 * They need to be persisted through page reloads.
 * They need to be kept in sync with all active tabs.
 * So, to achieve that, we store them in the local storage.
 *
 * Use showInitialXYZ functions to restore the state from the local storage.
 * Make sure to call them after the notifications are loaded.
 */
function useInAppEventsDisplay(
  notifications: Readonly<Ref<readonly NotificationFragment[]>>,
) {
  // useStorage handles the persistence and sync between tabs.
  const inAppNotificationIds = useStorage<string[]>(
    "in-app-notification-ids",
    [],
  );
  const { notify, notifications: inAppNotifications } =
    useInAppNotifications<NotificationFragment>();
  watch(
    inAppNotifications,
    (notifications) => {
      inAppNotificationIds.value = notifications.map(({ id }) => id);
    },
    { deep: true },
  );

  function showInitialInAppNotifications() {
    notifications.value.forEach((notification) => {
      if (inAppNotificationIds.value.includes(notification.id)) {
        notify(notification);
      }
    });
  }

  return {
    showInAppNotification: notify,
    showInitialInAppNotifications,
  };
}
