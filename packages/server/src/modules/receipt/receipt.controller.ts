import { createReadStream } from "node:fs";
import { Controller, Get, Header, Param, StreamableFile } from "@nestjs/common";
import type { UserModel } from "src/@generated/prisma/models";
import { AuthService } from "src/modules/auth/auth.service";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { ReceiptService } from "src/modules/receipt/receipt.service";

@Controller("/receipts")
export class ReceiptController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly receiptService: ReceiptService,
  ) {}

  @Get(":id")
  @Header("Content-Type", "application/pdf")
  async viewReceipt(
    @Param("id") receiptId: string,
    @CurrentUser() user: UserModel,
  ) {
    const receipt = await this.prisma.receipt.findUniqueOrThrow({
      where: {
        id: receiptId,
      },
    });

    if (user.id !== receipt.userId) {
      await this.authService.assertMembership({
        userId: user.id,
        retailLocationId: receipt.retailLocationId,
        message: "You are not authorized to view this receipt.",
      });
    }

    const { file } = this.receiptService.getReceiptPath(receipt);
    return new StreamableFile(createReadStream(file));
  }
}
