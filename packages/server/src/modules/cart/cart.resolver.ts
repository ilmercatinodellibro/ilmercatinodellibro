import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Mutation, ResolveField, Resolver, Root } from "@nestjs/graphql";
import { Prisma, Book as PrismaBook, Role, User } from "@prisma/client";
import { GraphQLVoid } from "graphql-scalars";
import { Book, Cart } from "src/@generated";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { Input } from "../auth/decorators/input.decorator";
import {
  AddToCartInput,
  FinalizeCartInput,
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

    let book: PrismaBook;

    if (fromBookIsbn) {
      const bookDetails = await this.prisma.book.findFirstOrThrow({
        where: { isbnCode: fromBookIsbn },
        include: {
          meta: true,
          requests: {
            where: {
              user: {
                ownedCart: {
                  id: cartId,
                },
              },
            },
          },
          reservations: {
            where: {
              user: {
                ownedCart: {
                  id: cartId,
                },
              },
            },
          },
        },
      });
      book = bookDetails;

      // The book availability is global, so we first check if the user already has a request or reservation for the book
      if (
        bookDetails.requests.length === 0 &&
        bookDetails.reservations.length === 0 &&
        !bookDetails.meta.isAvailable
      ) {
        throw new BadRequestException("The book is not available");
      }
    } else if (fromBookRequestId) {
      const request = await this.prisma.bookRequest.findUniqueOrThrow({
        where: { id: fromBookRequestId },
        include: {
          book: true,
        },
      });
      if (request.deletedAt !== null || request.saleId !== null) {
        throw new BadRequestException("The request is no longer valid");
      }

      book = request.book;
    } else if (fromReservationId) {
      const reservation = await this.prisma.reservation.findUniqueOrThrow({
        where: { id: fromReservationId },
        include: {
          book: true,
        },
      });
      if (reservation.deletedAt !== null || reservation.saleId !== null) {
        throw new BadRequestException("The reservation is no longer valid");
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

    await this.prisma.$transaction(async (prisma) => {
      await this.#finalizeCart(prisma, input);
    });
  }

  async #finalizeCart(
    prisma: Prisma.TransactionClient,
    { cartId, bookCopyIds }: FinalizeCartInput,
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
            saleId: null,
          },
        },
        reservations: {
          where: {
            userId: cart.userId,
            deletedAt: null,
            saleId: null,
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
        purchasedById: cart.user.id,
        iseeDiscountApplied: cart.user.discount,
        purchasedAt,
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
}
