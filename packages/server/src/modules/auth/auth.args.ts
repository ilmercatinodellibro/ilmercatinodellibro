import { Field, InputType, IntersectionType, PickType } from "@nestjs/graphql";
import { User } from "src/@generated/graphql/index.js";
import { LocationBoundInput } from "src/modules/retail-location/index.js";

@InputType()
export class RegisterPayload extends IntersectionType(
  PickType(
    User,
    ["email", "firstname", "lastname", "phoneNumber", "locale"],
    InputType,
  ),

  LocationBoundInput,
) {
  @Field()
  password!: string;

  @Field()
  passwordConfirmation!: string;

  @Field()
  dateOfBirth!: Date;
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
export class PasswordResetLinkPayload extends LocationBoundInput {
  @Field()
  email!: string;
}

@InputType()
export class RegistrationInviteLinkPayload extends LocationBoundInput {
  @Field()
  email!: string;
}

@InputType()
export class EmailVerificationPayload extends LocationBoundInput {
  @Field()
  userId!: string;
}

@InputType()
export class ResetForgottenPasswordPayload {
  @Field()
  newPassword!: string;
  @Field()
  confirmNewPassword!: string;
}
