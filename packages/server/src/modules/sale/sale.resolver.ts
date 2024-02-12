import { ForbiddenException } from "@nestjs/common";
import {
  Args,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";
import {
  BookCopy,
  BookRequest,
  Reservation,
  Role,
  Sale,
  User,
} from "src/@generated";
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
  ) {}

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

  @Query(() => [Sale])
  async userSales(
    @Args()
    queryArgs: UserSalesQueryArgs,
    @CurrentUser()
    { id: currentUserId, role }: User,
  ) {
    // TODO: this must come from the retailLocationId for which the current logged in user is an operator. Refactor later
    const currentRetailLocationId = "re";

    // Normal users can only view their own Sales
    if (currentUserId !== queryArgs.userId && role === Role.USER) {
      throw new ForbiddenException(
        "You do not have permission to view these sales.",
      );
    }

    return this.saleService.getUserSales(
      queryArgs.userId,
      currentRetailLocationId,
    );
  }

  @Query(() => [Sale])
  async userPurchases(
    @Args()
    queryArgs: UserPurchasesQueryArgs,
    @CurrentUser()
    { id: currentUserId, role }: User,
  ) {
    // TODO: this must come from the retailLocationId for which the current logged in user is an operator. Refactor later
    const currentRetailLocationId = "re";

    // Normal users can only view their own purchases
    if (currentUserId !== queryArgs.userId && role === Role.USER) {
      throw new ForbiddenException(
        "You do not have permission to view these purchases.",
      );
    }

    return this.saleService.getUserPurchases(
      queryArgs.userId,
      currentRetailLocationId,
    );
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async refundSale(
    @Input()
    input: RefundSaleInput,
    @CurrentUser()
    { id: currentUserId, role }: User,
  ) {
    // TODO: this must come from the retailLocationId for which the current logged in user is an operator. Refactor later
    const currentRetailLocationId = "re";

    return this.prisma.$transaction(async (prisma) => {
      const toRefund = await prisma.sale.findUniqueOrThrow({
        where: {
          id: input.id,
          bookCopy: {
            book: {
              retailLocationId: currentRetailLocationId,
            },
          },
        },
      });

      // TODO: this will need to get the role based on the retail location
      if (role === Role.USER) {
        throw new ForbiddenException(
          "You do not have permission to refund this sale.",
        );
      }

      if (toRefund.refundedAt) {
        throw new ForbiddenException("This sale has already been refunded.");
      }

      return this.saleService.refundSale(prisma, input.id, currentUserId);
    });
  }
  // TODO: at the moment I have not implemented here a way to create sale records,
  // because that will be part of the much larger checkout feature which makes use of the shopping cart.
}
