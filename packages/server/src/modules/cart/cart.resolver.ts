import { ForbiddenException } from "@nestjs/common";
import { Mutation, ResolveField, Resolver, Root } from "@nestjs/graphql";
import { Role, User } from "@prisma/client";
import { Book, Cart } from "src/@generated";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { Input } from "../auth/decorators/input.decorator";
import { OpenCartInput } from "./cart.input";

// TODO: Delete the cart 30 minutes after it was created

@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField(() => [Book])
  async books(@Root() cart: Cart) {
    const items = await this.prisma.cart
      .findUniqueOrThrow({
        where: { id: cart.id },
      })
      .items({
        select: { book: true },
      });

    return items.map(({ book }) => book);
  }

  @Mutation(() => Cart, {
    description:
      "Create a new cart for the user, or return the existing one if it exists.",
  })
  async openCart(
    @Input() { userId }: OpenCartInput,
    @CurrentUser() operator: User,
  ) {
    if (operator.role === Role.USER) {
      throw new ForbiddenException("Regular users cannot create carts");
    }

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });
    if (cart) {
      return cart;
    }

    return await this.prisma.cart.create({
      data: {
        userId,
        createdById: operator.id,
      },
    });
  }

  // TODO: Add to cart

  // TODO: Remove from cart (and restore to previous state, e.g. reserved or requested)

  // TODO: Checkout: accept selected copies for each book in the cart, then create the Sale entries and delete the cart
}
