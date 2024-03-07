import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReservationService {
  constructor(private readonly prisma: PrismaService) {}

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

    await this.prisma.reservation.updateMany({
      where: {
        expiresAt: {
          lte: now,
        },
        deletedAt: null,
      },
      data: {
        deletedAt: now,
      },
    });
  }
}
