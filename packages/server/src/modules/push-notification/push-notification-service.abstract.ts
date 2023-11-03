/// <reference lib="webworker" />
// NotificationOptions is from "webworker" lib types
type PatchedNotificationOptions = Omit<NotificationOptions, "silent"> & {
  // silent was marked as nullable, but it's not supposed to be nullable
  // https://developer.mozilla.org/en-US/docs/Web/API/Notification/silent
  silent?: boolean;
};

export type NotificationPayload = PatchedNotificationOptions & {
  title: string;
};

// Using an abstract class instead of an interface allows us to use dependency injection easily.
export abstract class PushNotificationService {
  abstract sendToUsers(
    notification: NotificationPayload,
    userIds: string[],
  ): Promise<void>;
}
