import {
  Args,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";
import { Receipt, User } from "src/@generated/graphql/index.js";
import { AuthService } from "src/modules/auth/auth.service.js";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator.js";
import { Input } from "src/modules/auth/decorators/input.decorator.js";
import { PrismaService } from "src/modules/prisma/prisma.service.js";
import { GetReceiptsArgs } from "src/modules/receipt/receipt.args.js";
import { ResendReceiptInput } from "src/modules/receipt/receipt.input.js";
import { ReceiptService } from "src/modules/receipt/receipt.service.js";

@Resolver(() => Receipt)
export class ReceiptResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly receiptService: ReceiptService,
  ) {}

  @Query(() => [Receipt])
  async receipts(
    @Args() { userId, retailLocationId }: GetReceiptsArgs,
    @CurrentUser() currentUser: User,
  ) {
    if (currentUser.id !== userId) {
      await this.authService.assertMembership({
        userId: currentUser.id,
        retailLocationId,
        message: "You are not authorized to view these receipts.",
      });
    }

    return this.prisma.receipt.findMany({
      where: {
        userId,
        retailLocationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  @ResolveField(() => User)
  async createdBy(@Root() { id }: Receipt) {
    return this.prisma.receipt
      .findUniqueOrThrow({
        where: {
          id,
        },
      })
      .createdBy();
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async resendReceipt(
    @Input() { receiptId }: ResendReceiptInput,
    @CurrentUser() currentUser: User,
  ) {
    const receipt = await this.prisma.receipt.findUniqueOrThrow({
      where: {
        id: receiptId,
      },
    });

    if (currentUser.id !== receipt.userId) {
      await this.authService.assertMembership({
        userId: currentUser.id,
        retailLocationId: receipt.retailLocationId,
        message: "You are not authorized to resend this receipt.",
      });
    }

    await this.receiptService.sendReceiptToUser(receipt);
  }
}
