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
import { ReservationService } from "./rerservation.service";
import { UserReservationsQueryArgs } from "./reservation.args";
import { DeleteReservationInput } from "./reservation.input";

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
