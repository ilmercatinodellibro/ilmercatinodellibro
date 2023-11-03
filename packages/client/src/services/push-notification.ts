import {
  useSubscribeToPushNotificationsMutation,
  useUnsubscribeFromPushNotificationsMutation,
} from "./push-notification.graphql";

export function usePushNotificationService() {
  const { subscribeToPushNotifications } =
    useSubscribeToPushNotificationsMutation();
  async function subscribe(deviceToken: string) {
    await subscribeToPushNotifications({
      input: {
        deviceToken,
      },
    });
  }

  const { unsubscribeFromPushNotifications } =
    useUnsubscribeFromPushNotificationsMutation();
  async function unsubscribe(deviceToken: string) {
    await unsubscribeFromPushNotifications({
      input: {
        deviceToken,
      },
    });
  }

  return {
    subscribe,
    unsubscribe,
  };
}
