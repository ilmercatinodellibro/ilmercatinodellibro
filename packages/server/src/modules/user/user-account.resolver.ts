import { ForbiddenException } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-scalars";
import { User } from "src/@generated/user";
import { AuthService } from "src/modules/auth/auth.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import {
  CancelUserAccountDeletionInput,
  DeleteUserAccountInput,
  GetUserDataArgs,
} from "./user-account.input";

@Resolver(() => User)
export class UserAccountResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @Query(() => GraphQLJSONObject, {
    description: "Returns all the data of a user account.",
  })
  async userData(
    @Args() { userId }: GetUserDataArgs,
    @CurrentUser() actor: User,
  ) {
    if (userId !== actor.id) {
      await this.authService.assertMembership({
        userId: actor.id,
        message: "You are not allowed to view user data of other users.",
      });
    }

    const { deletedAt } = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        deletedAt: true,
      },
    });
    if (deletedAt && deletedAt <= new Date()) {
      throw new ForbiddenException("This user account has been deleted.");
    }

    return await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        dateOfBirth: true,
        delegate: true,
        email: true,
        phoneNumber: true,
        notes: true,
        discount: true,
        createdAt: true,
        updatedAt: true,

        bookCopies: {
          include: {
            book: true,
            sales: {
              where: {
                refundedAt: null,
              },
              select: {
                id: true,
                purchasedAt: true,
                iseeDiscountApplied: true,
              },
            },
            problems: {
              select: {
                id: true,
                type: true,
                details: true,
                solution: true,
                createdAt: true,
                resolvedAt: true,
                bookCopyId: true,
              },
            },
          },
        },
        purchases: {
          include: {
            bookCopy: {
              include: {
                book: true,
              },
            },
          },
        },
        requestedBooks: {
          select: {
            id: true,
            createdAt: true,
            deletedAt: true,
            book: true,
          },
        },
        reservations: {
          select: {
            id: true,
            createdAt: true,
            expiresAt: true,
            deletedAt: true,
            book: true,
          },
        },
        ownedReceipts: {
          select: {
            id: true,
            type: true,
            createdAt: true,
            retailLocationId: true,
          },
        },
      },
    });
  }

  @Mutation(() => User, {
    description:
      "Schedule the deletion of a user account in 7 days. It can be canceled within this period by the operators.",
  })
  async deleteUserAccount(
    @Input() { userId }: DeleteUserAccountInput,
    @CurrentUser() actor: User,
  ) {
    if (userId !== actor.id) {
      await this.authService.assertMembership({
        userId: actor.id,
        message: "You are not allowed to delete user accounts of other users.",
      });
    }

    const HOUR = 60 * 60 * 1000;
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        deletedAt: new Date(Date.now() + 7 * 24 * HOUR), // 7 days from now
      },
    });
  }

  @Mutation(() => User, {
    description: "Cancel the scheduled deletion of a user account.",
  })
  async cancelUserAccountDeletion(
    @Input() { userId }: CancelUserAccountDeletionInput,
    @CurrentUser() operator: User,
  ) {
    await this.authService.assertMembership({
      userId: operator.id,
      message: "Only the operators can cancel the deletion of user accounts.",
    });

    const { deletedAt } = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        deletedAt: true,
      },
    });
    if (!deletedAt) {
      throw new ForbiddenException(
        "This user account is not scheduled for deletion.",
      );
    } else if (deletedAt <= new Date()) {
      throw new ForbiddenException(
        "This user account has already been deleted.",
      );
    }

    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        deletedAt: null,
      },
    });
  }
}
