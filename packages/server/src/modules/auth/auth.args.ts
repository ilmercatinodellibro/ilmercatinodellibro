import { Field, InputType, PickType } from "@nestjs/graphql";
import { User } from "src/@generated";

@InputType()
export class RegisterPayload extends PickType(
  User,
  ["email", "firstname", "lastname"],
  InputType,
) {
  @Field()
  password!: string;

  @Field()
  passwordConfirmation!: string;
}

@InputType()
export class LoginPayload extends PickType(User, ["email"], InputType) {
  @Field()
  password!: string;
}

@InputType()
export class PasswordResetPayload {
  @Field()
  currentPassword!: string;
  @Field()
  newPassword!: string;
  @Field()
  confirmNewPassword!: string;
}

@InputType()
export class PasswordResetLinkPayload {
  @Field()
  email!: string;
}

@InputType()
export class RegistrationInviteLinkPayload {
  @Field()
  email!: string;
}

@InputType()
export class ResetForgottenPasswordPayload {
  @Field()
  newPassword!: string;
  @Field()
  confirmNewPassword!: string;
}
