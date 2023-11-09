import { Mutation, Query, Resolver } from "@nestjs/graphql";
import { Book } from "src/@generated/book";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { BookCreatePayload, BookQueryPayload } from "./book.args";
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
    @Input()
    { page = 0, rows = 100 }: BookQueryPayload,
  ) {
    return this.prisma.book.findMany({
      skip: page * rows,
      take: rows,
    });
  }

  @Mutation(() => Book, { nullable: true })
  createBook(
    @Input()
    {
      authorsFullName,
      isbnCode,
      originalPrice,
      publisherName,
      retailLocationId,
      subject,
      title,
    }: BookCreatePayload,
  ) {
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
}
