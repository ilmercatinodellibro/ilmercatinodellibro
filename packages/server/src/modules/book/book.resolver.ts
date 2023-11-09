import { Mutation, Query, Resolver } from "@nestjs/graphql";
import { Book } from "src/@generated/book";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { BookCreatePayload, BookQueryPayload } from "./book.args";
// import { GraphQLVoid } from "graphql-scalars";
// import { UserService } from "./user.service";
// import { CurrentUser } from "../auth/decorators/current-user.decorator";
// @CurrentUser() { id: userId, firstname, lastname }: User,

@Resolver()
export class BookResolver {
  constructor(
    private readonly prisma: PrismaService /*,private readonly userService: UserService*/,
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
      title,
      authorsFullName,
      isbnCode,
      originalPrice,
      publisherName,
      retailLocationId,
      subject,
    }: BookCreatePayload,
  ) {
    // TODO: implement this
    // eslint-disable-next-line no-console
    console.log(
      "book: ",
      title,
      authorsFullName,
      isbnCode,
      originalPrice,
      publisherName,
      retailLocationId,
      subject,
    );

    return this.prisma.book.findMany();
  }
}
