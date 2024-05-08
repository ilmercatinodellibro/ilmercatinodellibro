import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getExpirationTime(retailLocationId = "re") {
    const retailLocation = await this.prisma.retailLocation.findFirstOrThrow({
      where: {
        id: retailLocationId,
      },
    });

    const expiration = new Date();
    expiration.setDate(expiration.getDate() + retailLocation.maxBookingDays);

    return expiration.toISOString();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredReservations() {
    const now = new Date();

    const reservationsToDelete = await this.prisma.reservation.findMany({
      where: {
        expiresAt: {
          lte: now,
        },
        deletedAt: null,
      },
    });
    if (reservationsToDelete.length === 0) {
      return;
    }

    await this.prisma.reservation.updateMany({
      where: {
        id: {
          in: reservationsToDelete.map(({ id }) => id),
        },
      },
      data: {
        deletedAt: now,
      },
    });

    this.eventEmitter.emit("booksBecameAvailable", {
      bookIds: reservationsToDelete.map(({ bookId }) => bookId),
    });
  }
}
