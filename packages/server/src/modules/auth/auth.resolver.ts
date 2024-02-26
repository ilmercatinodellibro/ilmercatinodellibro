import { UnprocessableEntityException, UseGuards } from "@nestjs/common";
import { Mutation, Resolver } from "@nestjs/graphql";
import { User } from "@prisma/client";
import { GraphQLVoid } from "graphql-scalars";
import { omit } from "lodash";
import { UserService } from "../user/user.service";
import {
  LoginPayload,
  PasswordResetLinkPayload,
  PasswordResetPayload,
  RegisterPayload,
  RegistrationInviteLinkPayload,
  ResetForgottenPasswordPayload,
} from "./auth.args";
import { AuthPayload } from "./auth.entity";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { Input } from "./decorators/input.decorator";
import { Public } from "./decorators/public-route.decorator";
import { LocalAuthGuard } from "./guards/local-auth.guard";

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Mutation(() => GraphQLVoid, { nullable: true })
  async register(
    @Input()
    registerPayload: RegisterPayload,
  ) {
    const existingUser = await this.userService.findUserByEmail(
      registerPayload.email,
    );
    // To prevent user enumeration attacks, we don't throw an error
    // TODO: it can still be guessed with the response time difference, add a relevant delay
    if (existingUser) {
      return;
    }

    if (registerPayload.password !== registerPayload.passwordConfirmation) {
      throw new UnprocessableEntityException(
        "Confirmation password doesn't match with provided password!",
      );
    }
    const user = await this.userService.createUser(
      omit(registerPayload, ["passwordConfirmation"]),
    );
    const token = this.authService.createVerificationToken(user.email);

    //TODO: use queues instead of doing await
    await this.authService.sendVerificationLink(user.email, token);
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async registerWithToken(
    @Input()
    registerPayload: RegisterPayload,
  ) {
    const existingUser = await this.userService.findUserByEmail(
      registerPayload.email,
    );
    // To prevent user enumeration attacks, we don't throw an error
    // TODO: it can still be guessed with the response time difference, add a relevant delay
    if (existingUser) {
      return;
    }

    if (registerPayload.password !== registerPayload.passwordConfirmation) {
      throw new UnprocessableEntityException(
        "Confirmation password doesn't match with provided password!",
      );
    }
    await this.userService.createUser(
      omit(registerPayload, ["passwordConfirmation"]),
      true,
    );
  }

  @Public()
  @Mutation(() => AuthPayload)
  // Validation and user extraction is handled by LocalStrategy via LocalAuthGuard
  @UseGuards(LocalAuthGuard)
  login(
    // This parameter is implicitly used by the LocalStrategy
    // We need it here to autogenerate the GraphQL schema
    // That's why it's defined as a param but not used within this method
    @Input()
    loginPayload: LoginPayload,
    @CurrentUser() user: User,
  ): AuthPayload {
    const jwt = this.authService.createAccessToken(user.id);

    return {
      jwt,
      user,
    };
  }

  @Public()
  @Mutation(() => GraphQLVoid, { nullable: true })
  async sendPasswordResetLink(@Input() { email }: PasswordResetLinkPayload) {
    const user = await this.userService.findUserByEmail(email);
    // To prevent user enumeration attacks, we don't throw an error
    // TODO: it can still be guessed with the response time difference, add a relevant delay
    if (!user) {
      return;
    }

    const token = this.authService.createAccessToken(user.id);
    await this.authService.sendPasswordResetLink(email, token);
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async resetForgottenPassword(
    @Input()
    { newPassword, confirmNewPassword }: ResetForgottenPasswordPayload,
    @CurrentUser() user: User,
  ) {
    if (newPassword !== confirmNewPassword) {
      throw new UnprocessableEntityException(
        "Confirmation password doesn't match with provided password!",
      );
    }
    if (await this.userService.verifyPassword(user.password, newPassword)) {
      throw new UnprocessableEntityException(
        "Invalid password, Try something else!",
      );
    }
    await this.userService.updatePassword({
      id: user.id,
      password: newPassword,
    });
  }

  @Mutation(() => String)
  refreshToken(@CurrentUser("id") userId: string): string {
    return this.authService.createAccessToken(userId);
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async resetPassword(
    @Input()
    { currentPassword, newPassword, confirmNewPassword }: PasswordResetPayload,
    @CurrentUser() user: User,
  ) {
    if (
      !(await this.userService.verifyPassword(user.password, currentPassword))
    ) {
      throw new UnprocessableEntityException(
        "Current password is entered is incorrect!",
      );
    }
    if (currentPassword === newPassword) {
      throw new UnprocessableEntityException(
        "New password cannot be same as current password!",
      );
    }
    if (newPassword !== confirmNewPassword) {
      throw new UnprocessableEntityException(
        "Confirmation password doesn't match with provided password!",
      );
    }
    await this.userService.updatePassword({
      id: user.id,
      password: newPassword,
    });
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async sendRegistrationInvite(
    @Input()
    { email }: RegistrationInviteLinkPayload,
    @CurrentUser() { firstname, id }: User,
  ) {
    const inviteToken = this.authService.createAccessToken(id);
    await this.authService.sendInviteLink(email, firstname, inviteToken);
  }
}
