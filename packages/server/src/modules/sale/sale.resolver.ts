import { ConflictException } from "@nestjs/common";
import {
  Args,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";
import { BookCopy, BookRequest, Reservation, Sale, User } from "src/@generated";
import { AuthService } from "src/modules/auth/auth.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { UserPurchasesQueryArgs, UserSalesQueryArgs } from "./sale.args";
import { RefundSaleInput } from "./sale.input";
import { SaleService } from "./sale.service";

@Resolver(() => Sale)
export class SaleResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly saleService: SaleService,
    private readonly authService: AuthService,
  ) {}

  @Query(() => [Sale])
  async userSales(
    @Args() { userId, retailLocationId }: UserSalesQueryArgs,
    @CurrentUser() { id: currentUserId }: User,
  ) {
    if (currentUserId !== userId) {
      await this.authService.assertMembership({
        userId: currentUserId,
        retailLocationId,
        message: "You do not have permission to view these sales.",
      });
    }

    return this.saleService.getUserSales(userId, retailLocationId);
  }

  @Query(() => [Sale])
  async userPurchases(
    @Args() { userId, retailLocationId }: UserPurchasesQueryArgs,
    @CurrentUser() { id: currentUserId }: User,
  ) {
    if (currentUserId !== userId) {
      await this.authService.assertMembership({
        userId: currentUserId,
        retailLocationId,
        message: "You do not have permission to view these purchases.",
      });
    }

    return this.saleService.getUserPurchases(userId, retailLocationId);
  }

  @ResolveField(() => BookCopy)
  async bookCopy(@Root() sale: Sale) {
    return this.prisma.sale
      .findUnique({
        where: {
          id: sale.id,
        },
      })
      .bookCopy();
  }

  @ResolveField(() => User)
  async purchasedBy(@Root() sale: Sale) {
    return this.prisma.sale
      .findUnique({
        where: {
          id: sale.id,
        },
      })
      .purchasedBy();
  }

  @ResolveField(() => User, { nullable: true })
  async refundedBy(@Root() sale: Sale) {
    if (!sale.refundedById) {
      return null;
    }

    return this.prisma.sale
      .findUnique({
        where: {
          id: sale.id,
        },
      })
      .refundedBy();
  }

  @ResolveField(() => Reservation, { nullable: true })
  async reservation(@Root() sale: Sale) {
    return this.prisma.sale
      .findUnique({
        where: {
          id: sale.id,
        },
      })
      .reservation();
  }

  @ResolveField(() => BookRequest)
  async bookRequest(@Root() sale: Sale) {
    return this.prisma.sale
      .findUnique({
        where: {
          id: sale.id,
        },
      })
      .bookRequest();
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async refundSale(
    @Input() { id }: RefundSaleInput,
    @CurrentUser() { id: currentUserId }: User,
  ) {
    return this.prisma.$transaction(async (prisma) => {
      const toRefund = await prisma.sale.findUniqueOrThrow({
        where: {
          id,
        },
        include: {
          bookCopy: {
            include: {
              book: true,
            },
          },
        },
      });

      await this.authService.assertMembership({
        userId: currentUserId,
        retailLocationId: toRefund.bookCopy.book.retailLocationId,
        message: "You do not have permission to refund this sale.",
      });

      if (toRefund.refundedAt) {
        throw new ConflictException("This sale has already been refunded.");
      }

      return this.saleService.refundSale(prisma, id, currentUserId);
    });
  }

  // see the Cart module for Sale creation logic
}
