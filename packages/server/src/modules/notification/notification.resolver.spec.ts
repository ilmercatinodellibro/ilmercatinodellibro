import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaService } from "../prisma/prisma.service.js";
import { NotificationResolver } from "./notification.resolver.js";

describe("NotificationResolver", () => {
  let resolver: NotificationResolver;
  const prisma = {
    notification: { findMany: vi.fn(), update: vi.fn() },
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [NotificationResolver],
    })
      .useMocker((token) => {
        if (token === PrismaService) {
          return prisma;
        }
        return {};
      })
      .compile();

    resolver = moduleRef.get(NotificationResolver);
  });

  it("should only list the notifications of the given user", async () => {
    await resolver.notifications("user-id");

    expect(prisma.notification.findMany).toHaveBeenCalledWith({
      where: { userId: "user-id" },
    });
  });

  it("should store when a notification is marked as read", async () => {
    await resolver.setNotificationReadStatus({
      id: "notification-id",
      read: true,
    });

    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: "notification-id" },
      data: { readAt: expect.any(Date) as Date },
    });
  });

  it("should clear the read date when a notification is marked as unread", async () => {
    await resolver.setNotificationReadStatus({
      id: "notification-id",
      read: false,
    });

    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: "notification-id" },
      data: { readAt: null },
    });
  });
});
