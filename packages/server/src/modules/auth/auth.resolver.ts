import { UnprocessableEntityException, UseGuards } from "@nestjs/common";
import { Mutation, Query, Resolver } from "@nestjs/graphql";
import { User } from "@prisma/client";
import { GraphQLVoid } from "graphql-scalars";
import { omit } from "lodash";
import { User as GraphQLUser } from "src/@generated";
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

  @Query(() => GraphQLUser)
  currentUser(@CurrentUser() user: User) {
    return user;
  }

  @Public()
  @Mutation(() => GraphQLVoid, { nullable: true })
  async register(@Input() payload: RegisterPayload) {
    const existingUser = await this.userService.findUserByEmail(payload.email);
    // To prevent user enumeration attacks, we don't throw an error
    // TODO: it can still be guessed with the response time difference, add a relevant delay
    if (existingUser) {
      return;
    }
    // TODO: should we notify the user if they are trying to register while their account is in the deletion grace period?

    if (payload.password !== payload.passwordConfirmation) {
      throw new UnprocessableEntityException(
        "Confirmation password doesn't match with provided password!",
      );
    }
    const user = await this.userService.createUser(
      omit(payload, ["passwordConfirmation", "retailLocationId"]),
    );
    const token = this.authService.createVerificationToken(
      payload.retailLocationId,
      user.email,
    );

    //TODO: use queues instead of doing await
    await this.authService.sendVerificationLink(
      payload.retailLocationId,
      user,
      token,
    );
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async registerWithToken(@Input() registerPayload: RegisterPayload) {
    // FIXME: VULNERABILITY - verify if this email is the one that was invited

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
      omit(registerPayload, ["passwordConfirmation", "retailLocationId"]),
      true,
    );
    // TODO: create the location membership with the operator role
  }

  @Public()
  @Mutation(() => AuthPayload)
  // Validation and user extraction is handled by LocalStrategy via LocalAuthGuard
  @UseGuards(LocalAuthGuard)
  login(
    // This parameter is implicitly used by the LocalStrategy
    // We need it here to autogenerate the GraphQL schema
    // That's why it's defined as a param but not used within this method
    @Input() _loginPayload: LoginPayload,
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
  async sendPasswordResetLink(
    @Input() { email, retailLocationId }: PasswordResetLinkPayload,
  ) {
    const user = await this.userService.findUserByEmail(email);
    // To prevent user enumeration attacks, we don't throw an error
    // TODO: it can still be guessed with the response time difference, add a relevant delay
    // TODO: if the deletion is in the grace period, should we send an email explaining the situation or just ignore it?
    if (!user || user.deletedAt) {
      return;
    }

    const token = this.authService.createAccessToken(user.id);
    await this.authService.sendPasswordResetLink(retailLocationId, user, token);
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async resetForgottenPassword(
    @Input() { newPassword, confirmNewPassword }: ResetForgottenPasswordPayload,
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
  refreshToken(@CurrentUser() user: User) {
    return this.authService.createAccessToken(user.id);
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
    @Input() { email, retailLocationId }: RegistrationInviteLinkPayload,
    @CurrentUser() operator: User,
  ) {
    // FIXME: VULNERABILITY: we are sending an access token of the current user. The user we are sending to can use that to impersonate the current user.
    const inviteToken = this.authService.createAccessToken(operator.id);
    await this.authService.sendInviteLink({
      toEmail: email,
      invitedBy: operator,
      token: inviteToken,
      locationId: retailLocationId,
    });
  }
}
