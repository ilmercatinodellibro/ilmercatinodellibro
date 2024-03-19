import { ForbiddenException } from "@nestjs/common";
import { Mutation, ResolveField, Resolver, Root } from "@nestjs/graphql";
import { BookCopy, Problem, User } from "src/@generated";
import { AuthService } from "src/modules/auth/auth.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { ProblemCreateInput, ProblemResolveInput } from "./problem.args";

@Resolver(() => Problem)
export class ProblemResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @ResolveField(() => User, { nullable: true })
  async resolvedBy(@Root() problem: Problem) {
    if (!problem.resolvedById) {
      return null;
    }

    return this.prisma.problem
      .findUnique({
        where: {
          id: problem.id,
        },
      })
      .resolvedBy();
  }

  @ResolveField(() => User)
  async createdBy(@Root() problem: Problem) {
    return this.prisma.problem
      .findUnique({
        where: {
          id: problem.id,
        },
      })
      .createdBy();
  }

  @ResolveField(() => BookCopy)
  async bookCopy(@Root() problem: Problem) {
    return this.prisma.problem
      .findUnique({
        where: {
          id: problem.id,
        },
      })
      .bookCopy();
  }

  @Mutation(() => Problem)
  async reportProblem(
    @Input() input: ProblemCreateInput,
    @CurrentUser() { id: userId }: User,
  ) {
    const bookCopy = await this.prisma.bookCopy.findUniqueOrThrow({
      where: {
        id: input.bookCopyId,
      },
      include: {
        book: true,
      },
    });

    await this.authService.assertMembership({
      userId,
      retailLocationId: bookCopy.book.retailLocationId,
      message:
        "You don't have the necessary permissions to create a new problem for this book copy.",
    });

    const unresolvedProblem = await this.prisma.problem.findFirst({
      where: {
        bookCopyId: input.bookCopyId,
        resolvedById: null,
      },
    });
    if (unresolvedProblem) {
      throw new ForbiddenException(
        "A problem is already active for the current book. Please, solve that problem first.",
      );
    }

    return this.prisma.problem.create({
      data: {
        createdById: userId,
        ...input,
      },
    });
  }

  @Mutation(() => Problem)
  async resolveProblem(
    @Input() { id, ...toUpdate }: ProblemResolveInput,
    @CurrentUser() { id: userId }: User,
  ) {
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: {
        id,
        resolvedById: null,
      },
      include: {
        bookCopy: {
          include: {
            book: true,
          },
        },
      },
    });

    await this.authService.assertMembership({
      userId,
      retailLocationId: problem.bookCopy.book.retailLocationId,
      message:
        "You don't have the necessary permissions to resolve a problem for this book copy.",
    });

    return this.prisma.problem.update({
      where: {
        id,
      },
      data: {
        ...toUpdate,
        resolvedById: userId,
        resolvedAt: new Date(),
      },
    });
  }
}
