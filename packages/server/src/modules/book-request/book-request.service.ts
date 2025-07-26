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
import { BookMeta } from "src/@generated";
import { NEW_NOTIFICATION_EVENT } from "src/modules/notification/notification.module";
import { NewNotificationPayload } from "src/modules/notification/send-push-notification.listener";
import { PrismaService } from "src/modules/prisma/prisma.service";

type RequestQueue = PrismaRequestQueue & {
  book: Book & { meta: BookMeta; retailLocation: RetailLocation };
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
    const retailLocations = await this.prisma.retailLocation.findMany({
      select: {
        id: true,
        maxBookingDays: true,
      },
    });

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
      const bookRetailLocation = retailLocations.find(
        (location) => location.id === book.retailLocationId,
      );

      // Avoid sending emails if reservations are disabled
      if (!bookRetailLocation || bookRetailLocation.maxBookingDays === 0) {
        continue;
      }

      if (
        book.requests.length === 0 ||
        // check for availability just in case
        !book.meta.isAvailable ||
        book.requestQueue
      ) {
        continue;
      }

      const request = book.requests[0];
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
        book: {
          include: {
            meta: true,
            retailLocation: true,
          },
        },
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
    if (!queue.book.meta.isAvailable) {
      await this.prisma.requestQueue.delete({
        where: { id: queue.id },
      });
      return;
    }

    await this.#notifyUser(queue.currentRequest, queue.book);

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
    });
    if (!nextRequest) {
      await this.prisma.requestQueue.delete({
        where: { id: queue.id },
      });

      return;
    }

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
    const { id: userId, locale } = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: request.userId,
      },
      select: {
        id: true,
        locale: true,
      },
    });

    // TODO: Maybe reuse the event (?)
    const { notifications, ...event } = await this.prisma.event.create({
      data: {
        name:
          locale === "en-US"
            ? "Requested Book Available"
            : "Libro richiesto disponibile",
        description:
          locale === "en-US"
            ? `The requested book "${book.title}" is now available for reservation.`
            : `Il libro "${book.title}" che era stato richiesto è adesso disponibile per essere prenotato.`,
        ownerId: request.userId,
        locationId: book.retailLocationId,
        notifications: {
          create: {
            userId,
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
