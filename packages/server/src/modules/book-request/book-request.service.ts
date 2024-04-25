import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Cron, CronExpression } from "@nestjs/schedule";
import {
  BookRequest,
  Prisma,
  RequestQueue as PrismaRequestQueue,
} from "@prisma/client";
import { PrismaService } from "src/modules/prisma/prisma.service";

type RequestQueue = PrismaRequestQueue & {
  currentRequest: BookRequest;
};

@Injectable()
export class BookRequestService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly availableRequestFilter = {
    deletedAt: null,
    OR: [
      {
        saleId: null,
      },
      {
        sale: {
          refundedAt: { not: null },
        },
      },
    ],
  } satisfies Prisma.BookRequestWhereInput;

  @OnEvent("booksBecameAvailable")
  async handleBooksBecameAvailable({ bookIds }: { bookIds: string[] }) {
    const books = await this.prisma.book.findMany({
      where: {
        id: { in: bookIds },
      },
      include: {
        requestQueue: true,
        meta: true,
        requests: {
          where: this.availableRequestFilter,
          orderBy: {
            createdAt: "asc",
          },
          take: 1,
        },
      },
    });

    for (const book of books) {
      if (
        book.requests.length === 0 ||
        // check for availability just in case
        !book.meta.isAvailable ||
        book.requestQueue
      ) {
        continue;
      }

      // TODO: Notify the user
      console.error("The requested book is now available", book.id);

      await this.prisma.requestQueue.create({
        data: {
          bookId: book.id,
          currentRequestId: book.requests[0].id,
          lastCheckedAt: new Date(),
        },
      });
    }
  }

  // TODO: this might not be necessary
  async handleRequestQueue(bookId: string) {
    const queue = await this.prisma.requestQueue.findUnique({
      where: {
        bookId,
      },
      include: {
        currentRequest: true,
      },
    });

    await this.#handleQueue(bookId, queue);
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleRequestQueues() {
    const queues = await this.prisma.requestQueue.findMany({
      where: {
        lastCheckedAt: {
          lte: this.#getProcessTickTime(),
        },
      },
      include: {
        currentRequest: true,
      },
    });

    for (const queue of queues) {
      await this.#handleQueue(queue.bookId, queue);
    }
  }

  #getProcessTickTime() {
    const minute = 60 * 1000;
    return new Date(Date.now() - 30 * minute);
  }

  async #handleQueue(bookId: string, queue: RequestQueue | null) {
    const nextRequest = await this.prisma.bookRequest.findFirst({
      where: {
        bookId,
        ...(queue
          ? { createdAt: { gte: queue.currentRequest.createdAt } }
          : {}),
        ...this.availableRequestFilter,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        book: {
          select: {
            meta: true,
          },
        },
      },
    });
    if (!nextRequest) {
      if (queue) {
        await this.prisma.requestQueue.delete({
          where: {
            id: queue.id,
          },
        });
      }

      return;
    }

    if (!nextRequest.book.meta.isAvailable) {
      await this.prisma.requestQueue.delete({
        where: {
          bookId,
        },
      });

      return;
    }

    // TODO: Notify the user
    console.error("The requested book is now available", bookId);

    await this.prisma.requestQueue.upsert({
      where: {
        bookId,
      },
      create: {
        bookId,
        currentRequestId: nextRequest.id,
        lastCheckedAt: new Date(),
      },
      update: {
        currentRequestId: nextRequest.id,
        lastCheckedAt: new Date(),
      },
    });
  }
}
