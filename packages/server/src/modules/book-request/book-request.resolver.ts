import { ConflictException } from "@nestjs/common";
import {
  Args,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";
import { Book, BookRequest, Sale, User } from "src/@generated";
import { AuthService } from "src/modules/auth/auth.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { BookRequestQueryArgs } from "./book-request.args";
import {
  CreateBookRequestInput,
  DeleteBookRequestInput,
} from "./book-request.input";

@Resolver(() => BookRequest)
export class BookRequestResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @Query(() => [BookRequest])
  async bookRequests(
    @Args() { userId, retailLocationId }: BookRequestQueryArgs,
    @CurrentUser() { id: currentUserId }: User,
  ) {
    if (currentUserId !== userId) {
      await this.authService.assertMembership({
        userId: currentUserId,
        retailLocationId,
        message: "You do not have permission to view these book requests.",
      });
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
                // All related sales must have been refunded in order to show the request
                sale: {
                  refundedAt: {
                    not: null,
                  },
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
                // All related reservations must have been deleted in order to show the request
                reservations: {
                  every: {
                    deletedAt: {
                      not: null,
                    },
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
    @CurrentUser() { id: currentUserId }: User,
  ) {
    const book = await this.prisma.book.findUniqueOrThrow({
      where: {
        id: bookId,
      },
    });

    if (currentUserId !== userId) {
      await this.authService.assertMembership({
        userId: currentUserId,
        retailLocationId: book.retailLocationId,
        message:
          "You do not have permission to create book requests for the given user.",
      });
    }

    return this.prisma.bookRequest.create({
      data: {
        bookId,
        userId,
        createdById: currentUserId,
      },
    });
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async deleteBookRequest(
    @Input() { id }: DeleteBookRequestInput,
    @CurrentUser() { id: currentUserId }: User,
  ) {
    const bookRequest = await this.prisma.bookRequest.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        book: true,
      },
    });

    if (currentUserId !== bookRequest.userId) {
      await this.authService.assertMembership({
        userId: currentUserId,
        retailLocationId: bookRequest.book.retailLocationId,
        message: "You do not have permission to delete this book request.",
      });
    }

    if (bookRequest.deletedAt !== null) {
      throw new ConflictException(
        "This book request has already been deleted.",
      );
    }

    return this.prisma.bookRequest.update({
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
