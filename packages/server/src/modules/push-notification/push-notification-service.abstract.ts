/// <reference lib="webworker" />

// Available in DOM types, but defined manually here to avoid importing the whole "dom" lib
type VibratePattern = number | number[];
interface NotificationAction {
  action: string;
  icon?: string;
  title: string;
}
// NotificationOptions is from "webworker" lib types
type PatchedNotificationOptions = Omit<NotificationOptions, "silent"> & {
  // silent was marked as nullable, but it's not supposed to be nullable
  // https://developer.mozilla.org/en-US/docs/Web/API/Notification/silent
  silent?: boolean;

  // These are only available in Blink-based browsers (Chrome, Edge, Opera, etc.)
  // So, they got removed from NotificationOptions type in TS 5.4
  // See https://github.com/microsoft/TypeScript/pull/57027#issuecomment-1992253738
  // But, we want to use them for the supported browsers, so we add them back
  actions?: NotificationAction[];
  image?: string;
  renotify?: boolean;
  timestamp?: EpochTimeStamp;
  vibrate?: VibratePattern;
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
