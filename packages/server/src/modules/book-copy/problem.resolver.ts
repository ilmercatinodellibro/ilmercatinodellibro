import { ForbiddenException } from "@nestjs/common";
import { Mutation, ResolveField, Resolver, Root } from "@nestjs/graphql";
import { BookCopy, Problem, Role, User } from "src/@generated";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { ProblemCreateInput, ProblemResolveInput } from "./problem.args";

@Resolver(Problem)
export class ProblemResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField(() => User, { nullable: true })
  async resolvedBy(@Root() problem: Problem) {
    if (!problem.resolvedById) {
      return null;
    }

    return this.prisma.user.findUnique({
      where: {
        id: problem.resolvedById,
      },
    });
  }

  @ResolveField(() => User)
  async createdBy(@Root() problem: Problem) {
    return this.prisma.user.findUnique({
      where: {
        id: problem.createdById,
      },
    });
  }

  @ResolveField(() => BookCopy)
  async bookCopy(@Root() problem: Problem) {
    return this.prisma.bookCopy.findUnique({
      where: {
        id: problem.bookCopyId,
      },
    });
  }

  //============ Problems ============
  @Mutation(() => Problem)
  async reportProblem(
    @Input()
    { bookCopyId, details, type }: ProblemCreateInput,
    @CurrentUser() { id: userId, role: userRole }: User,
  ) {
    if (userRole === Role.USER) {
      throw new ForbiddenException(
        "You don't have the necessary permissions to create a new problem for this book copy.",
      );
    }

    const unresolvedProblem = await this.prisma.problem.findFirst({
      where: {
        bookCopyId,
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
        bookCopyId,
        createdById: userId,
        details,
        type,
      },
    });
  }

  @Mutation(() => Problem)
  async resolveProblem(
    @Input()
    { id, solution }: ProblemResolveInput,
    @CurrentUser() { id: userId, role: userRole }: User,
  ) {
    if (userRole === Role.USER) {
      throw new ForbiddenException(
        "You don't have the necessary permissions to resolve a problem for this book copy.",
      );
    }

    await this.prisma.problem.findFirstOrThrow({
      where: {
        id, // If the problem does not exists, throw an error
        resolvedById: null, // If the problem was already solved, throw an exception because we must not override the old solution.
      },
    });

    return this.prisma.problem.update({
      where: {
        id,
      },
      data: {
        solution,
        resolvedById: userId,
        resolvedAt: new Date(),
      },
    });
  }
}
