import { Injectable } from "@nestjs/common";
import { PushNotificationService } from "./push-notification-service.abstract";

@Injectable()
export class VoidPushNotificationService implements PushNotificationService {
  async sendToUsers() {
    // do nothing
  }
}
