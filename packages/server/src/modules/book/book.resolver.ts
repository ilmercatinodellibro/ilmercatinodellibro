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
import { Prisma } from "@prisma/client";
import { Book } from "src/@generated/book";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { BookCreateInput, BookQueryArgs, BookQueryResult } from "./book.args";
import { BookService } from "./book.service";
// import { CurrentUser } from "../auth/decorators/current-user.decorator";
// @CurrentUser() { id: userId, firstname, lastname }: User,

@Resolver(() => Book)
export class BookResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookService: BookService,
  ) {}

  @Query(() => BookQueryResult)
  async books(
    @Args()
    {
      page = 0,
      rows: rowsPerPage = 100,
      filter: dirtyFilter = "",
    }: BookQueryArgs,
  ) {
    // TODO: Use Prisma full-text search
    // handle spaces by replacing them with % for the search
    const filter = dirtyFilter.trim().replaceAll(" ", "%");

    const where: Prisma.BookWhereInput = {
      retailLocationId: "re", // TODO: update this when retailLocations are properly handled

      OR: filter
        ? [
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
          ]
        : undefined,
    };

    const [rowsCount, rows] = await this.prisma.$transaction([
      this.prisma.book.count({ where }),
      this.prisma.book.findMany({
        skip: page * rowsPerPage,
        take: rowsPerPage,
        where,
      }),
    ]);

    return {
      page,
      filter,
      rowsCount,
      rows,
    };
  }

  @ResolveField(() => Boolean, {
    description: "Indicates if the book has any available copies for sale.",
  })
  async isAvailable(@Root() book: Book) {
    const availableCopies = await this.prisma.book
      .findUnique({
        where: { id: book.id },
      })
      .copies({
        where: {
          returnedAt: null,
          OR: [
            {
              sales: {
                none: {},
              },
            },
            {
              sales: {
                some: {
                  refundedAt: null,
                },
              },
            },
          ],
        },
        select: { id: true },
      });

    return availableCopies && availableCopies.length > 0;
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
      select: { id: true }, // only need to know if it exists
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
    } catch (error) {
      console.error("Cannot load books, error: ", error);
      throw new UnprocessableEntityException(
        "Cannot import or process files on server.",
      );
    }
  }
}
