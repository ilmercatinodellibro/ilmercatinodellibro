import { Injectable, Logger } from "@nestjs/common";
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
import { availableBookCopyFilter } from "src/modules/book-copy/book-copy.filters";
import { NEW_NOTIFICATION_EVENT } from "src/modules/notification/notification.module";
import { NewNotificationPayload } from "src/modules/notification/send-push-notification.listener";
import { PrismaService } from "src/modules/prisma/prisma.service";

type RequestQueue = PrismaRequestQueue & {
  book: Book & { meta: BookMeta; retailLocation: RetailLocation };
  currentRequest: BookRequest;
};

/**
 * The maximum daily amount of email sends that the SMTP service
 * allows per day (currently two 1k packages)
 */
const DAILY_EMAIL_QUOTA = 2000;

/**
 * The maximum reserved amount of daily sends for authentication
 * and receipts emails, must be less than {@link DAILY_EMAIL_QUOTA}
 */
const DAILY_AUTH_AND_RECEIPTS_EMAIL_QUOTA = 500;

/**
 * The time in minutes after which a newly inserted book copy
 * or expired/deleted reservation should trigger a notification
 * for the book being available for reservation
 */
const AVAILABILITY_COOLDOWN = 120;

/** Maximum size for each batch of queues */
const MAX_SENDS_PER_BATCH = 5;

/** Interval between batches in seconds */
const SECONDS_BETWEEN_BATCHES = 15;

/** The daily cap of emails for newly reservable books */
const DAILY_RESERVATION_EMAIL_QUOTA =
  DAILY_EMAIL_QUOTA - DAILY_AUTH_AND_RECEIPTS_EMAIL_QUOTA;

@Injectable()
export class BookRequestService {
  private readonly logger = new Logger(BookRequestService.name);

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

  /** The current amount of reservation email sends remaining for the day */
  private currentlyAvailableReservationEmails = DAILY_RESERVATION_EMAIL_QUOTA;

  /**
   * Every day at midnight, reset the currently available reservation
   * emails counter to the daily quota
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  resetAvailableReservationEmails() {
    this.logger.log(
      `Resetting the reservation availability email daily cap to ${DAILY_RESERVATION_EMAIL_QUOTA} sends`,
    );

    this.currentlyAvailableReservationEmails = DAILY_RESERVATION_EMAIL_QUOTA;
  }

  /**
   * The time in minutes after which a queue will be rechecked.
   * This value must respect the frequency of the `@Cron` handler
   */
  readonly #queueProcessingInterval = 60;

  // Every day at the start of every hour from 8 am to 9pm (included)
  @Cron("0 8-21 * * *")
  async handleRequestQueues() {
    if (this.currentlyAvailableReservationEmails === 0) {
      // No more emails are allowed from our SMTP service for the
      // day so we stop advancing the queues until the next day
      return;
    }

    this.logger.log(
      `Cron job running updating book request queues, remaining emails for the day: ${this.currentlyAvailableReservationEmails}`,
    );

    const cooldownCutoff = new Date();
    cooldownCutoff.setMinutes(
      cooldownCutoff.getMinutes() - AVAILABILITY_COOLDOWN,
    );

    const maxNumberOfBatches =
      (this.#queueProcessingInterval * 60) / SECONDS_BETWEEN_BATCHES;

    const queues = await this.prisma.requestQueue.findMany({
      where: {
        lastCheckedAt: {
          lte: this.#getProcessTickTime(),
        },
        book: {
          OR: [
            {
              // If some copies have just been added, wait before notifying the client
              // about them being available for reservation until the cooldown expires
              copies: {
                some: {
                  createdAt: {
                    lte: cooldownCutoff,
                  },

                  ...availableBookCopyFilter,
                },
              },
            },
            {
              // If some reservations were just deleted or just expired, wait before
              // processing them as contributing to the book being available for
              // reservation until the cooldown expires
              reservations: {
                some: {
                  OR: [
                    { deletedAt: { lte: cooldownCutoff, not: null } },
                    { expiresAt: { lte: cooldownCutoff } },
                  ],
                },
              },
            },
          ],
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
      take: Math.min(
        this.currentlyAvailableReservationEmails,
        maxNumberOfBatches * MAX_SENDS_PER_BATCH,
      ),
    });

    if (queues.length === 0) {
      this.logger.log("No queues to update");

      return;
    }

    const numberOfBatches = Math.ceil(queues.length / MAX_SENDS_PER_BATCH);

    for (let batchIndex = 0; batchIndex < numberOfBatches; batchIndex++) {
      const startTime = Date.now();

      const start = batchIndex * MAX_SENDS_PER_BATCH;
      const end = start + MAX_SENDS_PER_BATCH;
      const batch = queues.slice(start, end);

      await Promise.all(batch.map((queue) => this.#handleQueue(queue)));

      // If there are no more batches left, don't wait for any delay and just exit
      if (batchIndex === numberOfBatches - 1) {
        break;
      }

      const processingTime = Date.now() - startTime;

      if (processingTime > SECONDS_BETWEEN_BATCHES * 1000) {
        throw new Error(
          "A batch of emails for available books took too long to process",
        );
      }

      // Delay the next batch of sends to avoid rate limit errors from the SMTP service
      await new Promise((resolve) =>
        setTimeout(resolve, SECONDS_BETWEEN_BATCHES * 1000 - processingTime),
      );
    }
  }

  #getProcessTickTime() {
    const minute = 60 * 1000;
    return new Date(Date.now() - this.#queueProcessingInterval * minute);
  }

  async #handleQueue({
    book,
    bookId,
    id: queueId,
    currentRequest,
  }: RequestQueue) {
    if (!book.meta.isAvailable) {
      await this.prisma.requestQueue.delete({
        where: { id: queueId },
      });
      return;
    }

    await this.#notifyUser(currentRequest, book);

    this.currentlyAvailableReservationEmails--;

    const nextRequest = await this.prisma.bookRequest.findFirst({
      where: {
        bookId,
        id: { not: currentRequest.id },
        createdAt: { gte: currentRequest.createdAt },
        ...this.availableRequestFilter,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    if (!nextRequest) {
      await this.prisma.requestQueue.delete({
        where: { id: queueId },
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
