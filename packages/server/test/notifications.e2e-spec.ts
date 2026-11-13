import type { NestExpressApplication } from "@nestjs/platform-express";
import { createClient } from "graphql-ws";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Event, Notification } from "../src/@generated/prisma/client.js";
import { createApp } from "../src/create-app.js";
import { PublishToNotificationPubSubListener } from "../src/modules/notification/publish-to-notification-pubsub.listener.js";
import { PrismaService } from "../src/modules/prisma/prisma.service.js";
import {
  DEFAULT_PASSWORD,
  TEST_OPERATOR,
  TEST_USER,
} from "./fixtures/users.js";

const NOTIFICATION_FIELDS = "id event { id }";

describe("Notifications (e2e)", () => {
  let app: NestExpressApplication;
  let baseUrl: string;
  let prisma: PrismaService;
  let jwt: string;
  let event: Event;
  let notification: Notification;
  let otherUserNotification: Notification;

  async function graphql(query: string, variables?: Record<string, unknown>) {
    const response = await fetch(`${baseUrl}/graphql`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(jwt ? { authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
    return (await response.json()) as {
      data?: Record<string, unknown>;
      errors?: unknown[];
    };
  }

  beforeAll(async () => {
    app = await createApp();
    // Port 0 lets the OS pick a free port
    await app.listen(0);
    baseUrl = await app.getUrl();
    prisma = app.get(PrismaService);

    const { data } = await graphql(
      "mutation ($input: LoginPayload!) { login(input: $input) { jwt } }",
      { input: { email: TEST_USER.email, password: DEFAULT_PASSWORD } },
    );
    ({ jwt } = (data as { login: { jwt: string } }).login);

    event = await prisma.event.findFirstOrThrow();
    const users = await prisma.user.findMany({
      where: { email: { in: [TEST_USER.email, TEST_OPERATOR.email] } },
    });
    const userId = (email: string) =>
      users.find((user) => user.email === email)?.id ?? "";
    notification = await prisma.notification.create({
      data: { userId: userId(TEST_USER.email), eventId: event.id },
    });
    otherUserNotification = await prisma.notification.create({
      data: { userId: userId(TEST_OPERATOR.email), eventId: event.id },
    });
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({
      where: { id: { in: [notification.id, otherUserNotification.id] } },
    });
    await app.close();
  });

  it("should list the notifications of the user with their event", async () => {
    const result = await graphql(
      `{ notifications { ${NOTIFICATION_FIELDS} } }`,
    );

    expect(result).toEqual({
      data: {
        notifications: [{ id: notification.id, event: { id: event.id } }],
      },
    });
  });

  it("should send a new notification to the subscriptions of its user only", async () => {
    const client = createClient({
      url: `${baseUrl.replace(/^http/, "ws")}/subscriptions`,
      webSocketImpl: WebSocket,
      connectionParams: { authorization: `Bearer ${jwt}` },
      retryAttempts: 0,
    });
    const listener = app.get(PublishToNotificationPubSubListener);

    try {
      const received = new Promise<unknown>((resolve, reject) => {
        client.subscribe(
          {
            query: `subscription { newNotification { ${NOTIFICATION_FIELDS} } }`,
          },
          {
            next: resolve,
            error: reject,
            complete: () => {
              reject(
                new Error("The subscription ended without a notification"),
              );
            },
          },
        );
      });

      // The server registers the subscription some time after the client sends it,
      // and a notification published before that is lost, so publish until one arrives.
      // The notification of the other user goes first, so the filter is what keeps it out.
      const publishing = setInterval(() => {
        void listener.handleNewNotification({
          event,
          notification: otherUserNotification,
        });
        void listener.handleNewNotification({ event, notification });
      }, 100);

      try {
        await expect(received).resolves.toEqual({
          data: {
            newNotification: { id: notification.id, event: { id: event.id } },
          },
        });
      } finally {
        clearInterval(publishing);
      }
    } finally {
      await client.dispose();
    }
  });
});
