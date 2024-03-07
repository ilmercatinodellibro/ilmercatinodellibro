import { ForbiddenException } from "@nestjs/common";
import {
  Args,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { Book, BookRequest, Role, Sale, User } from "src/@generated";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { BookRequestQueryArgs } from "./book-request.args";
import { CreateBookRequestInput } from "./book-request.input";

@Resolver(() => BookRequest)
export class BookRequestResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [BookRequest])
  async bookRequests(
    @Args() { userId }: BookRequestQueryArgs,
    @CurrentUser() { id: currentUserId, role }: User,
  ) {
    // TODO: Make this dynamic
    const retailLocationId = "re";

    // Normal users can only view their own book requests
    if (currentUserId !== userId && role === Role.USER) {
      throw new ForbiddenException(
        "You do not have permission to view these book requests.",
      );
    }

    return this.prisma.bookRequest.findMany({
      where: {
        userId,
        book: {
          retailLocationId,
        },
        deletedAt: null,
        cartItem: null,
        AND: [
          {
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

          {
            OR: [
              {
                reservations: {
                  none: {},
                },
              },
              {
                reservations: {
                  every: {
                    deletedAt: null,
                  },
                },
              },
            ],
          },
        ],
      },
    });
  }

  @ResolveField(() => Book)
  async book(@Root() bookRequest: BookRequest) {
    return this.prisma.bookRequest
      .findUnique({
        where: {
          id: bookRequest.id,
        },
      })
      .book();
  }

  @ResolveField(() => User)
  async user(@Root() bookRequest: BookRequest) {
    return this.prisma.bookRequest
      .findUnique({
        where: {
          id: bookRequest.id,
        },
      })
      .user();
  }

  @ResolveField(() => User, { nullable: true })
  async deletedBy(@Root() bookRequest: BookRequest) {
    if (!bookRequest.deletedById) {
      return null;
    }

    return this.prisma.bookRequest
      .findUnique({
        where: {
          id: bookRequest.id,
        },
      })
      .deletedBy();
  }

  @ResolveField(() => Sale, { nullable: true })
  async sale(@Root() bookRequest: BookRequest) {
    if (!bookRequest.saleId) {
      return null;
    }

    return this.prisma.bookRequest
      .findUnique({
        where: {
          id: bookRequest.id,
        },
      })
      .sale();
  }

  @ResolveField(() => Boolean)
  async isInCart(@Root() bookRequest: BookRequest) {
    const cartItem = await this.prisma.bookRequest
      .findUniqueOrThrow({
        where: {
          id: bookRequest.id,
        },
      })
      .cartItem({
        select: { id: true },
      });

    return cartItem !== null;
  }

  @Mutation(() => BookRequest)
  async createBookRequest(
    @Input() { userId, bookId }: CreateBookRequestInput,
    @CurrentUser() { id: currentUserId, role }: User,
  ) {
    if (currentUserId !== userId && role === Role.USER) {
      throw new ForbiddenException(
        "You do not have permission to create book requests for the given user.",
      );
    }

    return this.prisma.bookRequest.create({
      data: {
        bookId,
        userId,
      },
    });
  }
}
