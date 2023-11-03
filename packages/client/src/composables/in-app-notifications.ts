/*
  This is fundamentally similar Quasar's Notify plugin, but the main aim is to work with custom components.
  It has much less features/configurability than Quasar's Notify, but it works with custom components which brings a different kind of flexibility.
  It can be enriched with more features/configurability in the future and might even be extracted into a separate package.
*/

import {
  Component,
  ComputedRef,
  InjectionKey,
  Plugin,
  Ref,
  TransitionGroup,
  computed,
  createApp,
  defineComponent,
  h,
  inject,
  ref,
} from "vue";

export const InAppNotificationsSymbol = Symbol(
  "InAppNotifications",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) as InjectionKey<InAppNotifications<any>>;

export function useInAppNotifications<TNotification>() {
  const result = inject<InAppNotifications<TNotification>>(
    InAppNotificationsSymbol,
  );
  if (!result) {
    throw new Error("InAppNotifications is not installed");
  }
  return result;
}

export function createInAppNotifications<TNotification>({
  component,
  notificationKey,
  topMargin = 0,
  gap = 16,
  enterTransition = "animated fadeInUp",
  leaveTransition = "animated fadeOutUp",
}: CreateInAppNotificationsOptions<TNotification>): InAppNotifications<TNotification> &
  Plugin {
  const getKey = (notification: TNotification) =>
    notificationKey instanceof Function
      ? notificationKey(notification)
      : notification[notificationKey];

  const notifications = ref([]) as Ref<TNotification[]>;

  const RootComponent = defineComponent({
    name: "InAppNotifications",
    setup() {
      return () =>
        h(
          TransitionGroup,
          {
            tag: "div",
            class: "column",
            style: {
              position: "absolute",
              top: `${topMargin + gap}px`,
              right: `${gap}px`,
              gap: `${gap}px`,
            },
            enterActiveClass: enterTransition,
            leaveActiveClass: leaveTransition,
          },
          () =>
            notifications.value.map((notification, index) =>
              h(component, {
                key: getKey(notification),
                notification,
                onClose: () => notifications.value.splice(index, 1),
              }),
            ),
        );
    },
  });

  const inAppNotifications: InAppNotifications<TNotification> = {
    notifications: computed(() => notifications.value),
    notify: (notification: TNotification) => {
      notifications.value.push(notification);

      return {
        close: () => {
          const index = notifications.value.findIndex(
            (_notification) => getKey(_notification) === getKey(notification),
          );
          if (index !== -1) {
            notifications.value.splice(index, 1);
          }
        },
      };
    },
  };

  return {
    install(parentApp) {
      parentApp.provide(InAppNotificationsSymbol, inAppNotifications);

      const element = document.createElement("div");
      element.id = "in-app-notifications";
      document.body.appendChild(element);

      const app = createApp(RootComponent);
      app.config.globalProperties = parentApp.config.globalProperties;
      Object.assign(app._context, parentApp._context);

      app.mount(element);

      return app;
    },

    ...inAppNotifications,
  };
}

export interface InAppNotifications<TNotification> {
  notifications: ComputedRef<TNotification[]>;
  notify: (notification: TNotification) => {
    close: () => void;
  };
}

export interface CreateInAppNotificationsOptions<TNotification> {
  component: Component;
  notificationKey:
    | keyof TNotification
    | ((notification: TNotification) => string | symbol | number);
  topMargin?: number;
  gap?: number;
  enterTransition?: string;
  leaveTransition?: string;
}
