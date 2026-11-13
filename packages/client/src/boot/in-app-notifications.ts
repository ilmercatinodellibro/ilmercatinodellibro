import { defineBoot } from "#q-app";
import InAppNotification from "@/components/events/in-app-notification.vue";
import { createInAppNotifications } from "@/composables/in-app-notifications";
import type { NotificationFragment } from "@/services/notification.graphql";

export default defineBoot(({ app }) => {
  app.use(
    createInAppNotifications<NotificationFragment>({
      component: InAppNotification,
      notificationKey: ({ id }) => id,
      topMargin: 64, // header height
    }),
  );
});
