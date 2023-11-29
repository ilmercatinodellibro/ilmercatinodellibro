import { ForbiddenException } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Role, User } from "src/@generated";
import { Book } from "src/@generated/book";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { BookCopyCreateInput, BookCopyQueryArgs } from "./book-copy.args";
import { BookCopyService } from "./book-copy.service";

@Resolver()
export class BookCopyResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookService: BookCopyService,
  ) {}

  @Query(() => [Book])
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

  @Mutation(() => Book, { nullable: true })
  async createBookCopy(
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

    const bookCopy = this.prisma.$transaction(async (prisma) => {
      const booksCodes = await this.bookService.calculateBookCodes(
        prisma,
        bookIds,
        "re",
      );

      return prisma.bookCopy.createMany({
        data: booksCodes.map((generatedCode, index) => ({
          bookId: bookIds[index],
          code: generatedCode,
          createdById: userId,
          ownerId,
          originalCode: generatedCode,
          updatedById: userId,
        })),
      });
    });

    return bookCopy;
  }
}
