import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaService } from "../prisma/prisma.service.js";
import { EventResolver } from "./event.resolver.js";

describe("EventResolver", () => {
  let resolver: EventResolver;
  const findMany = vi.fn();

  beforeEach(async () => {
    findMany.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [EventResolver],
    })
      .useMocker((token) => {
        if (token === PrismaService) {
          return { event: { findMany } };
        }
      })
      .compile();

    resolver = moduleRef.get(EventResolver);
  });

  it("should list all the events", async () => {
    const events = [{ id: "event-1" }, { id: "event-2" }];
    findMany.mockResolvedValue(events);

    await expect(resolver.events()).resolves.toBe(events);
    expect(findMany).toHaveBeenCalledWith();
  });
});
