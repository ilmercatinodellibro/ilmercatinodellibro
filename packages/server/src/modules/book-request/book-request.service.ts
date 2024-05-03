import { Injectable } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { Cron, CronExpression } from "@nestjs/schedule";
import {
  Book,
  BookRequest,
  Prisma,
  RequestQueue as PrismaRequestQueue,
  RetailLocation,
} from "@prisma/client";
import { NEW_NOTIFICATION_EVENT } from "src/modules/notification/notification.module";
import { NewNotificationPayload } from "src/modules/notification/send-push-notification.listener";
import { PrismaService } from "src/modules/prisma/prisma.service";

type RequestQueue = PrismaRequestQueue & {
  currentRequest: BookRequest;
};

@Injectable()
export class BookRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
        retailLocation: true,
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

      const request = book.requests[0];
      await this.#notifyUser(request, book);

      await this.prisma.requestQueue.create({
        data: {
          bookId: book.id,
          currentRequestId: request.id,
          lastCheckedAt: new Date(),
        },
      });
    }
  }

  /**
   * The time in minutes after which a queue should be rechecked.
   * Don't forget to update the `@Cron` decorator when changing this value.
   */
  readonly #queueProcessingInterval = 30;

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
    return new Date(Date.now() - this.#queueProcessingInterval * minute);
  }

  async #handleQueue(bookId: string, queue: RequestQueue) {
    const nextRequest = await this.prisma.bookRequest.findFirst({
      where: {
        bookId,
        id: { not: queue.currentRequest.id },
        createdAt: { gte: queue.currentRequest.createdAt },
        ...this.availableRequestFilter,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        book: {
          include: {
            meta: true,
            retailLocation: true,
          },
        },
      },
    });
    if (!nextRequest || !nextRequest.book.meta.isAvailable) {
      await this.prisma.requestQueue.delete({
        where: { id: queue.id },
      });

      return;
    }

    await this.#notifyUser(nextRequest, nextRequest.book);

    await this.prisma.requestQueue.update({
      where: {
        bookId,
      },
      data: {
        currentRequestId: nextRequest.id,
        lastCheckedAt: new Date(),
      },
    });
  }

  async #notifyUser(
    request: BookRequest,
    book: Book & { retailLocation: RetailLocation },
  ) {
    // TODO: Maybe reuse the event (?)
    const { notifications, ...event } = await this.prisma.event.create({
      data: {
        // name: `Requested Book Available - ${book.retailLocation.name}`,
        // description: `The requested book "${book.title}" is now available for reservation.`,
        name: `Libro richiesto disponibile - ${book.retailLocation.name}`,
        description: `Il libro "${book.title}" che era stato richiesto è adesso disponibile per essere prenotato.`,
        ownerId: request.userId,
        notifications: {
          create: {
            userId: request.userId,
          },
        },
      },
      include: {
        notifications: true,
      },
    });
    this.eventEmitter.emit(NEW_NOTIFICATION_EVENT, {
      event,
      notification: notifications[0],
    } satisfies NewNotificationPayload);
  }
}
