import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReservationService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserReservations(
    userId: string,
    retailLocationId = "re",
    showDeleted = false,
  ) {
    return this.prisma.reservation.findMany({
      where: {
        userId,
        ...(!showDeleted ? { deletedAt: null } : {}),
        book: {
          retailLocation: {
            id: retailLocationId,
          },
        },
      },
    });
  }

  async deleteReservation(id: string, deletedById: string) {
    return this.prisma.reservation.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date().toISOString(),
        deletedById,
      },
    });
  }

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
