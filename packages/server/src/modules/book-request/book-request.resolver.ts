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
import { BookRequestService } from "./book-request.service";

@Resolver(() => BookRequest)
export class BookRequestResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookRequestService: BookRequestService,
  ) {}

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

  @Query(() => [BookRequest])
  async bookRequests(
    @Args()
    queryArgs: BookRequestQueryArgs,
    @CurrentUser()
    { id: currentUserId, role }: User,
  ) {
    // TODO: this must come from the retailLocationId for which the current logged in user is an operator. Refactor later
    const currentRetailLocationId = "re";

    // Normal users can only view their own book requests
    if (currentUserId !== queryArgs.userId && role === Role.USER) {
      throw new ForbiddenException(
        "You do not have permission to view these book requests.",
      );
    }

    return this.bookRequestService.getUserBookRequests(
      queryArgs.userId,
      currentRetailLocationId,
    );
  }

  @Mutation(() => BookRequest)
  async createBookRequest(
    @Input()
    input: CreateBookRequestInput,
    @CurrentUser()
    { id: currentUserId, role }: User,
  ) {
    if (currentUserId !== input.userId && role === Role.USER) {
      throw new ForbiddenException(
        "You do not have permission to create book requests for the given user.",
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      // TODO: probably needs to add a check that prevents creating multiple book requests for the same book for a given user on the current retail location
      return this.bookRequestService.createBookRequest(
        prisma,
        input.userId,
        input.bookId,
      );
    });
  }
}
