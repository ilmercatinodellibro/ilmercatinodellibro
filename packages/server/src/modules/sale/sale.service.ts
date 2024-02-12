import { Injectable } from "@nestjs/common";
import { PrismaTransactionClient } from "../../helpers/prisma";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SaleService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserSales(userId: string, retailLocationId: string) {
    return this.prisma.sale.findMany({
      where: {
        bookCopy: {
          ownerId: userId,
          book: {
            retailLocationId,
          },
        },
        refundedAt: null,
      },
    });
  }

  async getUserPurchases(userId: string, retailLocationId: string) {
    return this.prisma.sale.findMany({
      where: {
        purchasedById: userId,
        bookCopy: {
          book: {
            retailLocationId,
          },
        },
        refundedAt: null,
      },
    });
  }

  async refundSale(
    prisma: PrismaTransactionClient,
    saleId: string,
    refundingOperatorId: string,
  ) {
    return prisma.sale.update({
      where: {
        id: saleId,
      },
      data: {
        refundedAt: new Date().toISOString(),
        refundedById: refundingOperatorId,
      },
    });
  }
}
