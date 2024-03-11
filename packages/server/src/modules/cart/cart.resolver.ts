import {
  BadRequestException,
  ForbiddenException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Mutation, ResolveField, Resolver, Root } from "@nestjs/graphql";
import { Prisma, Book as PrismaBook, Role, User } from "@prisma/client";
import { GraphQLVoid } from "graphql-scalars";
import { Book, Cart } from "src/@generated";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { Input } from "../auth/decorators/input.decorator";
import {
  AddToCartInput,
  DeleteCartInput,
  FinalizeCartInput,
  OpenCartInput,
  RemoveFromCartInput,
} from "./cart.input";
import { CartService } from "./cart.service";

@Resolver(() => Cart)
export class CartResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
  ) {}

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
    @Input() { userId, retailLocationId }: OpenCartInput,
    @CurrentUser() operator: User,
  ) {
    if (operator.role === Role.USER) {
      throw new ForbiddenException("Regular users cannot create carts");
    }

    const cart = await this.prisma.cart.findUnique({
      where: {
        userId_retailLocationId: {
          userId,
          retailLocationId,
        },
      },
    });
    if (cart) {
      if (!this.cartService.isCartExpired(cart)) {
        return cart;
      }

      await this.prisma.cart.delete({
        where: { id: cart.id },
      });
    }

    return await this.prisma.cart.create({
      data: {
        userId,
        retailLocationId,
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

    const cart = await this.cartService.ensureCartNotExpired(cartId);

    let book: PrismaBook;

    if (fromBookIsbn) {
      const bookDetails = await this.prisma.book.findFirstOrThrow({
        where: {
          isbnCode: fromBookIsbn,
          retailLocationId: cart.retailLocationId,
        },
        include: {
          meta: true,
          reservations: {
            where: {
              userId: cart.userId,
              deletedAt: null,
            },
          },
          copies: {
            where: {
              sales: {
                some: {
                  purchasedById: cart.userId,
                  refundedAt: null,
                },
              },
            },
          },
        },
      });
      book = bookDetails;

      if (bookDetails.copies.length > 0) {
        throw new UnprocessableEntityException(
          "The book has already been bought by the user",
        );
      }

      // The book availability applies to all users, so we first check if this specific user already has a reservation for the book
      if (
        bookDetails.reservations.length === 0 &&
        !bookDetails.meta.isAvailable
      ) {
        throw new UnprocessableEntityException("The book is not available");
      }
    } else if (fromBookRequestId) {
      const request = await this.prisma.bookRequest.findUniqueOrThrow({
        where: { id: fromBookRequestId },
        include: {
          book: true,
          sale: true,
        },
      });
      if (
        request.deletedAt !== null ||
        (request.saleId !== null && request.sale?.refundedAt !== null)
      ) {
        throw new UnprocessableEntityException(
          "The request is no longer valid",
        );
      }
      if (request.book.retailLocationId !== cart.retailLocationId) {
        throw new UnprocessableEntityException(
          "The book request is not for the same retail location as the cart",
        );
      }

      book = request.book;
    } else if (fromReservationId) {
      const reservation = await this.prisma.reservation.findUniqueOrThrow({
        where: { id: fromReservationId },
        include: {
          book: true,
          sale: true,
        },
      });
      if (
        reservation.deletedAt !== null ||
        (reservation.saleId !== null && reservation.sale?.refundedAt !== null)
      ) {
        throw new UnprocessableEntityException(
          "The reservation is no longer valid",
        );
      }
      if (reservation.book.retailLocationId !== cart.retailLocationId) {
        throw new UnprocessableEntityException(
          "The reservation is not for the same retail location as the cart",
        );
      }

      book = reservation.book;
    } else {
      throw new Error("Unreachable code"); // to satisfy TypeScript
    }

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

    await this.cartService.ensureCartNotExpired(cartId);

    await this.prisma.cartItem.delete({
      where: {
        cartId_bookId: {
          cartId,
          bookId,
        },
      },
    });
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async finalizeCart(
    @Input() input: FinalizeCartInput,
    @CurrentUser() operator: User,
  ) {
    if (operator.role === Role.USER) {
      throw new ForbiddenException("Regular users cannot modify carts");
    }

    await this.cartService.ensureCartNotExpired(input.cartId);

    await this.prisma.$transaction(async (prisma) => {
      await this.#finalizeCart(prisma, input, operator);
    });
  }

  async #finalizeCart(
    prisma: Prisma.TransactionClient,
    { cartId, bookCopyIds }: FinalizeCartInput,
    operator: User,
  ) {
    const cart = await prisma.cart.findUniqueOrThrow({
      where: { id: cartId },
      include: {
        user: true,
      },
    });

    const books = await prisma.book.findMany({
      where: {
        cartItems: {
          some: {
            cartId,
          },
        },
      },
      include: {
        requests: {
          where: {
            userId: cart.userId,
            deletedAt: null,
            OR: [
              {
                saleId: null,
              },
              {
                sale: {
                  refundedAt: null,
                },
              },
            ],
          },
        },
        reservations: {
          where: {
            userId: cart.userId,
            deletedAt: null,
            OR: [
              {
                saleId: null,
              },
              {
                sale: {
                  refundedAt: null,
                },
              },
            ],
          },
        },
      },
    });

    const bookCopies = await prisma.bookCopy.findMany({
      where: {
        id: {
          in: bookCopyIds,
        },
      },
    });

    const cartBookIds = books.map(({ id }) => id);
    const selectedBookIds = bookCopies.map(({ bookId }) => bookId);
    if (!selectedBookIds.every((id) => cartBookIds.includes(id))) {
      throw new BadRequestException(
        "Given book copies do not match the list of books in the cart",
      );
    }

    const purchasedAt = new Date();
    await prisma.sale.createMany({
      data: bookCopies.map((bookCopy) => ({
        bookCopyId: bookCopy.id,
        purchasedAt,
        purchasedById: cart.user.id,
        iseeDiscountApplied: cart.user.discount,
        createdById: operator.id,
        cartCreatedById: cart.createdById,
      })),
    });
    // createMany doesn't return the created entries, so we have to query them again
    const sales = await prisma.sale.findMany({
      where: {
        bookCopyId: {
          in: bookCopies.map(({ id }) => id),
        },
        purchasedAt,
      },
    });
    // Connect requests and reservations to the sales
    await Promise.all(
      sales.map(async (sale) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const bookCopy = bookCopies.find(({ id }) => id === sale.bookCopyId)!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const book = books.find(({ id }) => id === bookCopy.bookId)!;

        if (book.requests.length > 0) {
          // There can only be one request per book per user (already filtered to ensure it's not fulfilled or deleted)
          const request = book.requests[0];
          await prisma.bookRequest.update({
            where: { id: request.id },
            data: {
              saleId: sale.id,
            },
          });
        }

        if (book.reservations.length > 0) {
          // There can only be one reservation per book per user (already filtered to ensure it's not fulfilled or deleted)
          const reservation = book.reservations[0];
          await prisma.reservation.update({
            where: { id: reservation.id },
            data: {
              saleId: sale.id,
            },
          });
        }
      }),
    );

    await prisma.cart.delete({
      where: { id: cartId },
    });
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async deleteCart(
    @Input() { cartId }: DeleteCartInput,
    @CurrentUser() operator: User,
  ) {
    if (operator.role === Role.USER) {
      throw new ForbiddenException("Regular users cannot delete carts");
    }

    await this.prisma.cart.delete({
      where: { id: cartId },
    });
  }
}
