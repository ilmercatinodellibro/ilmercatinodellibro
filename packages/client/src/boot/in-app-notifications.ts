import { boot } from "quasar/wrappers";
import InAppNotification from "src/components/events/in-app-notification.vue";
import { createInAppNotifications } from "src/composables/in-app-notifications";
import type { NotificationFragment } from "src/services/notification.graphql";

export default boot(({ app }) => {
  app.use(
    createInAppNotifications<NotificationFragment>({
      component: InAppNotification,
      notificationKey: ({ id }) => id,
      topMargin: 64, // header height
    }),
  );
});
