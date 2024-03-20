import {
  ConflictException,
  UnprocessableEntityException,
} from "@nestjs/common";
import {
  Args,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";
import { Book, Reservation, Sale, User } from "src/@generated";
import { AuthService } from "src/modules/auth/auth.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { UserReservationsQueryArgs } from "./reservation.args";
import {
  CreateReservationInput,
  DeleteReservationInput,
} from "./reservation.input";

@Resolver(() => Reservation)
export class ReservationResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @Query(() => [Reservation])
  async userReservations(
    @Args() { userId, retailLocationId }: UserReservationsQueryArgs,
    @CurrentUser() { id: currentUserId }: User,
  ) {
    if (currentUserId !== userId) {
      await this.authService.assertMembership({
        userId: currentUserId,
        retailLocationId,
        message: "You do not have permission to view these reservations.",
      });
    }

    return this.prisma.reservation.findMany({
      where: {
        userId,
        deletedAt: null,
        cartItem: null,
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
        book: {
          retailLocationId,
        },
      },
    });
  }

  @ResolveField(() => Book)
  async book(@Root() reservation: Reservation) {
    return this.prisma.reservation
      .findUnique({
        where: {
          id: reservation.id,
        },
      })
      .book();
  }

  @ResolveField(() => User)
  async user(@Root() reservation: Reservation) {
    return this.prisma.reservation
      .findUnique({
        where: {
          id: reservation.id,
        },
      })
      .user();
  }

  @ResolveField(() => User)
  async createdBy(@Root() reservation: Reservation) {
    return this.prisma.reservation
      .findUnique({
        where: {
          id: reservation.id,
        },
      })
      .createdBy();
  }

  @ResolveField(() => User, { nullable: true })
  async deletedBy(@Root() reservation: Reservation) {
    if (!reservation.deletedById) {
      return null;
    }

    return this.prisma.reservation
      .findUnique({
        where: {
          id: reservation.id,
        },
      })
      .deletedBy();
  }

  @ResolveField(() => Sale, { nullable: true })
  async sale(@Root() reservation: Reservation) {
    if (!reservation.saleId) {
      return null;
    }

    return this.prisma.reservation
      .findUnique({
        where: {
          id: reservation.id,
        },
      })
      .sale();
  }

  @ResolveField(() => Boolean)
  async isInCart(@Root() reservation: Reservation) {
    const cartItem = await this.prisma.reservation
      .findUniqueOrThrow({
        where: {
          id: reservation.id,
        },
      })
      .cartItem({
        select: { id: true },
      });

    return cartItem !== null;
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async createReservations(
    @Input() { userId, bookIds, retailLocationId }: CreateReservationInput,
    @CurrentUser() { id: currentUserId }: User,
  ) {
    if (currentUserId !== userId) {
      await this.authService.assertMembership({
        userId,
        retailLocationId,
        message:
          "You do not have permission to create reservations for this user.",
      });
    }

    const books = await this.prisma.book.findMany({
      where: { id: { in: bookIds } },
      include: {
        reservations: {
          where: {
            userId,
            deletedAt: null,
          },
        },
        requests: {
          where: {
            userId,
            deletedAt: null,
          },
        },
        meta: true,
      },
    });

    if (books.length !== bookIds.length) {
      throw new UnprocessableEntityException(
        "One or more books given are not found.",
      );
    }

    if (books.some(({ requests }) => requests.length > 1)) {
      throw new UnprocessableEntityException(
        "Logic Error: One or more books somehow have more than one active request by the user.",
      );
    }

    if (books.some(({ reservations }) => reservations.length > 0)) {
      throw new UnprocessableEntityException(
        "One or more books given are already reserved by the user.",
      );
    }

    if (
      books.some(
        ({ meta, requests }) => !meta.isAvailable && requests.length > 0,
      )
    ) {
      throw new UnprocessableEntityException(
        "One or more books given are already requested by the user and not available.",
      );
    }

    if (
      books.some(
        ({ requests }) => requests.length > 0 && requests[0].saleId !== null,
      )
    ) {
      throw new UnprocessableEntityException(
        "One or more books given have already been bought by the user.",
      );
    }

    if (books.some((book) => book.retailLocationId !== retailLocationId)) {
      throw new UnprocessableEntityException(
        "One or more books given belong to a different retail location than the one specified.",
      );
    }

    const booksToPromoteRequests = books.filter(
      ({ meta, requests }) => meta.isAvailable && requests.length > 0,
    );
    const booksToRequestAndReserve = books.filter(
      ({ meta, requests }) => meta.isAvailable && requests.length === 0,
    );
    const booksToRequest = books.filter(
      ({ meta, requests }) => !meta.isAvailable && requests.length === 0,
    );

    const retailLocation = await this.prisma.retailLocation.findUniqueOrThrow({
      where: { id: retailLocationId },
    });
    await this.prisma.$transaction(async (prisma) => {
      const expiresAt = new Date(
        Date.now() + retailLocation.maxBookingDays * 24 * 60 * 60 * 1000,
      );

      if (booksToPromoteRequests.length > 0) {
        await prisma.reservation.createMany({
          data: booksToPromoteRequests.map(({ id, requests }) => ({
            bookId: id,
            userId,
            createdById: currentUserId,
            expiresAt,
            requestId: requests[0].id,
          })),
        });
      }

      if (booksToRequestAndReserve.length > 0) {
        await prisma.bookRequest.createMany({
          data: booksToRequestAndReserve.map(({ id }) => ({
            bookId: id,
            userId,
            createdById: currentUserId,
          })),
        });

        const requests = await prisma.bookRequest.findMany({
          where: {
            bookId: { in: booksToRequestAndReserve.map(({ id }) => id) },
            userId,
          },
        });

        await prisma.reservation.createMany({
          data: requests.map(({ id, bookId }) => ({
            bookId,
            userId,
            createdById: currentUserId,
            expiresAt,
            requestId: id,
          })),
        });
      }

      if (booksToRequest.length > 0) {
        await prisma.bookRequest.createMany({
          data: booksToRequest.map(({ id }) => ({
            bookId: id,
            userId,
            createdById: currentUserId,
          })),
        });
      }
    });
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async deleteReservation(
    @Input() { id }: DeleteReservationInput,
    @CurrentUser() { id: currentUserId }: User,
  ) {
    const reservation = await this.prisma.reservation.findUniqueOrThrow({
      where: { id },
      include: {
        book: true,
      },
    });

    if (currentUserId !== reservation.userId) {
      await this.authService.assertMembership({
        userId: currentUserId,
        retailLocationId: reservation.book.retailLocationId,
        message: "You do not have permission to delete this reservation.",
      });
    }

    if (reservation.deletedAt !== null) {
      throw new ConflictException("This reservation has already been deleted.");
    }

    return this.prisma.reservation.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        deletedById: currentUserId,
      },
    });
  }
}
