import { ForbiddenException } from "@nestjs/common";
import { Mutation, ResolveField, Resolver, Root } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";
import { BookCopy, Problem, Role, Sale, User } from "src/@generated";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { SaleRefundInput } from "./sale.args";

@Resolver(Sale)
export class SaleResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField(() => User)
  async purchasedBy(@Root() sale: Sale) {
    return this.prisma.user.findUnique({
      where: {
        id: sale.purchasedById,
      },
    });
  }

  @ResolveField(() => User, { nullable: true })
  async refundedBy(@Root() sale: Sale) {
    if (!sale.refundedById) {
      return null;
    }

    return this.prisma.user.findUnique({
      where: {
        id: sale.refundedById,
      },
    });
  }

  @ResolveField(() => BookCopy)
  async bookCopy(@Root() problem: Problem) {
    return this.prisma.bookCopy.findUnique({
      where: {
        id: problem.bookCopyId,
      },
    });
  }

  //============ Problems ============
  @Mutation(() => GraphQLVoid, { nullable: true })
  async refundSale(
    @Input()
    { saleId }: SaleRefundInput,
    @CurrentUser() { id: userId, role: userRole }: User,
  ) {
    if (userRole === Role.USER) {
      throw new ForbiddenException(
        "You don't have the necessary permissions to create a new problem for this book copy.",
      );
    }

    const registeredSale = await this.prisma.sale.findUniqueOrThrow({
      where: {
        id: saleId,
      },
    });

    if (registeredSale.refundedById) {
      throw new ForbiddenException(
        "This sale transaction has already been refunded. It cannot be refunded again.",
      );
    }

    await this.prisma.sale.update({
      where: {
        id: saleId,
      },
      data: {
        refundedById: userId,
        refundedAt: new Date(),
      },
    });
  }
}
