import { ForbiddenException } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Role, User } from "src/@generated";
import { BookCopy } from "src/@generated/book-copy";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import {
  BookCopyByOwnerQueryArgs,
  BookCopyCreateInput,
  BookCopyQueryArgs,
} from "./book-copy.args";
import { BookCopyService } from "./book-copy.service";

@Resolver()
export class BookCopyResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookService: BookCopyService,
  ) {}

  @Query(() => [BookCopy])
  async bookCopies(
    @Args()
    { bookId }: BookCopyQueryArgs,
  ) {
    return this.prisma.bookCopy.findMany({
      where: {
        bookId,
      },
    });
  }

  @Query(() => [BookCopy])
  async bookCopiesByOwner(
    @Args()
    { ownerId }: BookCopyByOwnerQueryArgs,
  ) {
    const currentRetailLocationId = "re"; // TODO: this must come from the retailLocationId for which the current logged in user is an operator. Refactor later
    return this.prisma.bookCopy.findMany({
      where: {
        ownerId,
        book: {
          retailLocationId: currentRetailLocationId,
        },
      },
    });
  }

  @Mutation(() => Int, { nullable: true })
  async createBookCopies(
    @Input()
    { bookIds, ownerId }: BookCopyCreateInput,
    @CurrentUser() { id: userId, role: userRole }: User,
  ) {
    if (userRole === Role.USER) {
      throw new ForbiddenException(
        "You don't have the necessary permissions to create a new book for this retail location.",
      );
    }

    const currentRetailLocationId = "re"; // TODO: this must come from the retailLocationId for which the current logged in user is an operator. Refactor later
    const books = await this.prisma.book.findMany({
      select: {
        id: true,
        retailLocationId: true, // TODO: must add a control for the locationId
      },
      where: {
        id: {
          in: bookIds,
        },
      },
    });

    if (
      !books.every((book) => book.retailLocationId === currentRetailLocationId)
    ) {
      throw new ForbiddenException(
        "You are trying to create books for a retail location for which you don't have operator permissions.",
      );
    }

    const bookCopies = await this.prisma.$transaction(async (prisma) => {
      const booksCodes = await this.bookService.calculateBookCodes(
        prisma,
        bookIds,
        currentRetailLocationId,
      );

      return prisma.bookCopy.createMany({
        data: booksCodes.map((generatedCode, index) => ({
          bookId: bookIds[index],
          code: generatedCode,
          createdById: userId,
          ownerId,
          updatedById: userId,
        })),
      });
    });

    return bookCopies.count;
  }
}