import { Injectable } from "@nestjs/common";
import { PrismaTransactionClient } from "../../helpers/prisma";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BookRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserBookRequests(userId: string, retailLocationId: string) {
    return this.prisma.bookRequest.findMany({
      where: {
        userId,
        book: {
          retailLocationId,
        },
      },
    });
  }

  async createBookRequest(
    prisma: PrismaTransactionClient,
    userId: string,
    bookId: string,
  ) {
    return prisma.bookRequest.create({
      data: {
        bookId,
        createdAt: new Date().toISOString(),
        userId,
      },
    });
  }
}
