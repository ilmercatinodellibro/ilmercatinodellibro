import { Injectable } from "@nestjs/common";
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
}
