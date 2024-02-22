import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Mutation, ResolveField, Resolver, Root } from "@nestjs/graphql";
import { Role, User } from "@prisma/client";
import { GraphQLVoid } from "graphql-scalars";
import { Book, Cart } from "src/@generated";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { Input } from "../auth/decorators/input.decorator";
import {
  AddToCartInput,
  OpenCartInput,
  RemoveFromCartInput,
} from "./cart.input";

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

  @Mutation(() => Book)
  async addToCart(
    @Input()
    {
      cartId,
      fromBookIsbn,
      fromBookRequestId,
      fromReservationId,
    }: AddToCartInput,
    @CurrentUser() operator: User,
  ) {
    if (operator.role === Role.USER) {
      throw new ForbiddenException("Regular users cannot modify carts");
    }

    const inputs = [fromBookIsbn, fromBookRequestId, fromReservationId].filter(
      (input) => input !== undefined,
    );
    if (inputs.length !== 1) {
      throw new BadRequestException(
        "Exactly one of bookIsbn, fromBookRequestId, or fromReservationId must be provided",
      );
    }

    // TODO: validate if the request or reservation is still valid (not expired, not already fulfilled, etc.)

    const book = await this.prisma.book.findFirstOrThrow({
      where: {
        OR: [
          {
            isbnCode: fromBookIsbn,
          },
          {
            requests: {
              some: {
                id: fromBookRequestId,
              },
            },
          },
          {
            reservations: {
              some: {
                id: fromReservationId,
              },
            },
          },
        ],
      },
    });

    await this.prisma.cartItem.create({
      data: {
        cartId,
        bookId: book.id,

        fromBookRequestId,
        fromReservationId,
      },
    });

    return book;
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async removeFromCart(
    @Input() { cartId, bookId }: RemoveFromCartInput,
    @CurrentUser() operator: User,
  ) {
    if (operator.role === Role.USER) {
      throw new ForbiddenException("Regular users cannot modify carts");
    }

    await this.prisma.cartItem.delete({
      where: {
        cartId_bookId: {
          cartId,
          bookId,
        },
      },
    });
  }

  // TODO: Checkout: accept selected copies for each book in the cart, then create the Sale entries and delete the cart
}
