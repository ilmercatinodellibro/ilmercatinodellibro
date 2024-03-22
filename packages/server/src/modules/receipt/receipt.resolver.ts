import { Args, Query, ResolveField, Resolver, Root } from "@nestjs/graphql";
import { Receipt, Reservation, User } from "src/@generated";
import { AuthService } from "src/modules/auth/auth.service";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { GetReceiptsArgs } from "src/modules/receipt/receipt.args";

@Resolver(() => Reservation)
export class ReceiptResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
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
}
