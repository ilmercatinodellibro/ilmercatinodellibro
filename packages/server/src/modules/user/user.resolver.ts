import { Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";
import { User } from "src/@generated/user";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { RemoveUserPayload, UpdateRolePayload } from "./user.args";
import { UserService } from "./user.service";

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => [User])
  async users() {
    return this.prisma.user.findMany({
      where: {
        emailVerified: true,
      },
    });
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  removeUser(
    @Input()
    { id }: RemoveUserPayload,
  ) {
    return this.userService.removeUser(id);
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async updateRole(
    @Input()
    userData: UpdateRolePayload,
  ) {
    await this.userService.updateUserRole(userData);
  }
}
