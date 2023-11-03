import { Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";
import { User } from "src/@generated/user";
import { Input } from "../auth/decorators/input.decorator";
import { RemoveUserPayload, UpdateRolePayload } from "./user.args";
import { UserService } from "./user.service";

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  async users() {
    const users = await this.userService.getUsers();
    return users.filter((user) => user.emailVerified);
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
