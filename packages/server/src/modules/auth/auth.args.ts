import { Field, InputType, PickType } from "@nestjs/graphql";
import { UserCreateInput } from "src/@generated";

@InputType()
export class RegisterPayload extends PickType(
  UserCreateInput,
  ["email", "password", "firstname", "lastname"],
  InputType,
) {
  @Field()
  passwordConfirmation!: string;
}

@InputType()
export class LoginPayload extends PickType(
  UserCreateInput,
  ["email", "password"],
  InputType,
) {}

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
