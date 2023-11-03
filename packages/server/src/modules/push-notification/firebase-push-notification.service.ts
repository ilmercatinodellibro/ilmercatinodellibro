import { Injectable } from "@nestjs/common";
import { mapLimit } from "async";
import { BatchResponse, Messaging } from "firebase-admin/messaging";
import { chunk } from "lodash";
import { PrismaService } from "../prisma/prisma.service";
import {
  NotificationPayload,
  PushNotificationService,
} from "./push-notification-service.abstract";

declare module "async" {
  // If no callback is provided as the 4th argument, a promise is returned. This overload is missing from @types/async.
  export function mapLimit<T, R, E = Error>(
    arr: IterableCollection<T>,
    limit: number,
    iterator: AsyncResultIterator<T, R, E>,
  ): Promise<R[]>;
}

@Injectable()
export class FirebasePushNotificationService
  implements PushNotificationService
{
  // This may depend on the server resources.
  // If this doesn't work or we discover it can be improved, we can accept this via configuration.
  private readonly PARALLEL_REQUESTS = 4;

  constructor(
    private readonly messaging: Messaging,
    private readonly prisma: PrismaService,
  ) {}

  async sendToUsers(notification: NotificationPayload, userIds: string[]) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: {
        userId: {
          in: userIds,
        },
      },
    });

    const chunks = chunk(subscriptions, 500);
    const batchResponses = await mapLimit<
      (typeof chunks)[number],
      BatchResponse
    >(chunks, this.PARALLEL_REQUESTS, async (chunk) => {
      try {
        return await this.messaging.sendEachForMulticast({
          tokens: subscriptions.map(({ deviceToken }) => deviceToken),
          // Most common basic options
          notification: {
            title: notification.title,
            body: notification.body,
            imageUrl: notification.image,
          },
          webpush: {
            // Web Push specific options
            notification,
          },
        });
      } catch (error) {
        return {
          responses: chunk.map(() => ({
            success: false,
            error,
          })),
          successCount: 0,
          failureCount: chunk.length,
        };
      }
    });

    const failedTokens = batchResponses
      .flatMap(({ responses }) => responses)
      // the index is important, so we must save it before filtering
      .map((response, index) => [response, subscriptions[index]] as const)
      .filter(
        ([{ error }]) =>
          error &&
          // https://firebase.google.com/docs/cloud-messaging/send-message#admin
          (error.code === "messaging/registration-token-not-registered" ||
            error.code === "messaging/invalid-registration-token"),
      )
      .map(([, { deviceToken }]) => deviceToken);

    await this.prisma.pushSubscription.deleteMany({
      where: {
        deviceToken: {
          in: failedTokens,
        },
      },
    });
  }
}
