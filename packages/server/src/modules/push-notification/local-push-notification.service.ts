import { Injectable } from "@nestjs/common";
import notifier from "node-notifier";
import {
  NotificationPayload,
  PushNotificationService,
} from "./push-notification-service.abstract";

@Injectable()
export class LocalPushNotificationService implements PushNotificationService {
  sendToUsers(notification: NotificationPayload, userIds: string[]) {
    notifier.notify({
      title: notification.title,
      message: notification.body,
      actions: ["Log User IDs"],
    });

    notifier.once("click", (_, __, { activationType, activationValue }) => {
      if (activationType !== "actionClicked") {
        return;
      }

      if (activationValue === "Log User IDs") {
        // eslint-disable-next-line no-console
        console.log("User IDs:", userIds);
      }
    });

    // to satisfy the interface
    return Promise.resolve();
  }
}
