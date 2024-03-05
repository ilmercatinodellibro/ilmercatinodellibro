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
import { Book, Reservation, Role, Sale, User } from "src/@generated";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { UserReservationsQueryArgs } from "./reservation.args";
import {
  CreateReservationInput,
  DeleteReservationInput,
} from "./reservation.input";
import { ReservationService } from "./reservation.service";

@Resolver(() => Reservation)
export class ReservationResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reservationService: ReservationService,
  ) {}

  @Query(() => [Reservation])
  async userReservations(
    @Args() { userId }: UserReservationsQueryArgs,
    @CurrentUser() { id: currentUserId, role }: User,
  ) {
    // TODO: this must come from the retailLocationId for which the current logged in user is an operator. Refactor later
    const currentRetailLocationId = "re";

    // Normal users can only view their own Reservations
    if (currentUserId !== userId && role === Role.USER) {
      throw new ForbiddenException(
        "You do not have permission to view these reservations.",
      );
    }

    return this.reservationService.getUserReservations(
      userId,
      currentRetailLocationId,
    );
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

  // TODO: use this to hide the reservation from the list when the related book is in a cart
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
    @Input() { userId, bookIds }: CreateReservationInput,
    @CurrentUser() { id: currentUserId, role }: User,
  ) {
    if (currentUserId !== userId && role === Role.USER) {
      throw new ForbiddenException(
        "You do not have permission to create reservations for this user.",
      );
    }

    const retailLocationId = "re"; // TODO: make this dynamic

    const books = await this.prisma.book.findMany({
      where: { id: { in: bookIds } },
      include: {
        reservations: {
          where: { userId },
        },
        requests: {
          where: { userId },
        },
        meta: true,
      },
    });

    if (books.length !== bookIds.length) {
      throw new ForbiddenException("One or more books given are not found.");
    }

    if (books.some(({ reservations }) => reservations.length > 0)) {
      throw new ForbiddenException(
        "One or more books given are already reserved by the user.",
      );
    }

    if (
      books.some((book) => book.requests.length > 0 && !book.meta.isAvailable)
    ) {
      throw new ForbiddenException(
        "One or more books given are already requested by the user and not available.",
      );
    }

    const retailLocation = await this.prisma.retailLocation.findUniqueOrThrow({
      where: { id: retailLocationId },
    });
    if (books.some((book) => book.retailLocationId !== retailLocation.id)) {
      throw new ForbiddenException(
        "One or more books given belong to a different retail location.",
      );
    }

    const booksToReserve = books.filter(({ meta }) => meta.isAvailable);
    const booksToPromoteRequests = books.filter(
      ({ requests, meta }) => requests.length > 0 && !meta.isAvailable,
    );
    const booksToRequest = books.filter(
      ({ requests, meta }) => requests.length === 0 && !meta.isAvailable,
    );

    await this.prisma.$transaction(async (prisma) => {
      // TODO: delete expired reservations on a schedule, similar to how expired carts are handled
      const expiresAt = new Date(
        Date.now() + retailLocation.maxBookingDays * 24 * 60 * 60 * 1000,
      );

      await prisma.reservation.createMany({
        data: booksToReserve.map(({ id }) => ({
          bookId: id,
          userId,
          createdById: currentUserId,
          expiresAt,
        })),
      });

      // TODO: instead of deleting the request, connect the request to the reservation, so that:
      // - when the reservation expires, the request is still there
      // - the connection/history between the request and the reservation is kept
      await prisma.bookRequest.updateMany({
        where: {
          bookId: { in: booksToPromoteRequests.map(({ id }) => id) },
          userId,
        },
        data: {
          deletedAt: new Date(),
          deletedById: currentUserId,
        },
      });
      await prisma.reservation.createMany({
        data: booksToPromoteRequests.map(({ id }) => ({
          bookId: id,
          userId,
          createdById: currentUserId,
          expiresAt,
        })),
      });

      await prisma.bookRequest.createMany({
        data: booksToRequest.map(({ id }) => ({
          bookId: id,
          userId,
          createdById: currentUserId,
        })),
      });
    });
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async deleteReservation(
    @Input() { id }: DeleteReservationInput,
    @CurrentUser() { id: currentUserId, role }: User,
  ) {
    const reservation = await this.prisma.reservation.findUniqueOrThrow({
      where: { id },
    });

    if (currentUserId !== reservation.userId && role === Role.USER) {
      throw new ForbiddenException(
        "You do not have permission to delete this reservation.",
      );
    }

    return this.reservationService.deleteReservation(id, currentUserId);
  }
}
