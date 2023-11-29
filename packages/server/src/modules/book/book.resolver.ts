import {
  ConflictException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Book } from "src/@generated/book";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { BookCreateInput, BookQueryArgs } from "./book.args";
import { BookService } from "./book.service";
// import { CurrentUser } from "../auth/decorators/current-user.decorator";
// @CurrentUser() { id: userId, firstname, lastname }: User,

@Resolver()
export class BookResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookService: BookService,
  ) {}

  @Query(() => [Book])
  async books(
    @Args()
    { page = 0, rows = 100, filter: dirtyFilter = "" }: BookQueryArgs,
  ) {
    const filter = dirtyFilter.trim();

    return this.prisma.book.findMany({
      skip: page * rows,
      take: rows,
      where: {
        retailLocationId: "re",
        ...(filter
          ? {
              OR: [
                {
                  authorsFullName: {
                    contains: filter,
                    mode: "insensitive",
                  },
                },
                {
                  isbnCode: {
                    contains: filter,
                    mode: "insensitive",
                  },
                },
                {
                  publisherName: {
                    contains: filter,
                    mode: "insensitive",
                  },
                },
                {
                  title: {
                    contains: filter,
                    mode: "insensitive",
                  },
                },
                {
                  subject: {
                    contains: filter,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
    });
  }

  @Mutation(() => Book, { nullable: true })
  async createBook(
    @Input()
    {
      authorsFullName,
      isbnCode,
      originalPrice,
      publisherName,
      retailLocationId,
      subject,
      title,
    }: BookCreateInput,
  ) {
    const bookExistsForRetailLocation = await this.prisma.book.findFirst({
      where: {
        retailLocationId,
        isbnCode,
      },
    });
    if (bookExistsForRetailLocation) {
      throw new ConflictException(
        "Book already exists for the specified retail location.",
      );
    }

    // TODO: add guard for user. Must ensure that role is operator or higher and that it is inserting the user for a retail point for which they have permission to do that.
    return this.prisma.book.create({
      data: {
        authorsFullName,
        isbnCode,
        originalPrice,
        publisherName,
        retailLocationId,
        subject,
        title,
      },
    });
  }

  @Mutation(() => Boolean)
  async loadBooksIntoDatabase() {
    try {
      const result = await this.bookService.loadBooksIntoDb();

      if (!result) {
        throw new UnprocessableEntityException(
          "Unable to process and import the books from the source file.",
        );
      }

      return result;
    } catch {
      throw new UnprocessableEntityException(
        "Cannot import or process files on server.",
      );
    }
  }
}
