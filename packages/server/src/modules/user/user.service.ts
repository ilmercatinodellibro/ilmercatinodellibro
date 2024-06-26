import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { FederationProvider } from "@prisma/client";
import * as argon2 from "argon2";
import { Profile } from "passport";
import { PASSWORD_STUB_HASH } from "prisma/factories/user";
import { RegisterPayload } from "src/modules/auth/auth.args";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { RegisterUserPayload } from "src/modules/user/user.args";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUser(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async removeUser(id: string) {
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async createUser(
    userData: Omit<
      Partial<RegisterUserPayload> & RegisterPayload,
      "passwordConfirmation" | "retailLocationId"
    >,
    emailVerified?: boolean,
  ) {
    userData.email = userData.email.toLowerCase();
    userData.password = await argon2.hash(userData.password);

    return this.prisma.user.create({
      data: {
        ...userData,
        emailVerified,
      },
    });
  }

  async createFederatedUser({
    id,
    name,
    emails,
    provider,
  }: Profile & { provider: FederationProvider }) {
    if (!name) {
      throw new Error("No name found");
    }

    if (!emails || emails.length === 0) {
      throw new Error("No email found");
    }

    const user = await this.findUserByProvider(provider, id);
    if (user) {
      return user;
    }

    const email = emails[0].value;
    return this.prisma.user.upsert({
      where: {
        email,
      },
      create: {
        firstname: name.givenName,
        lastname: name.familyName,
        email,
        emailVerified: true,
        // to satisfy the schema by still preserving the security
        password: await argon2.hash(Math.random().toString(16)),

        federatedUsers: {
          create: {
            provider,
            providerUserId: id,
          },
        },
      },
      update: {
        federatedUsers: {
          create: {
            provider,
            providerUserId: id,
          },
        },
      },
    });
  }

  async updatePassword({ id, password }: { id: string; password: string }) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        password: await argon2.hash(password),
      },
    });
  }

  async verifyPassword(passwordHash: string, currentPassword: string) {
    return await argon2.verify(passwordHash, currentPassword);
  }

  // We apply best practices to prevent user enumeration attacks
  // See https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-and-error-messages
  async validateUser(email: string, password: string) {
    const existingUser = await this.findUserByEmail(email);

    const passwordIsCorrect = await argon2.verify(
      // Prevents discrepancies due to processing time
      // Always execute all commands, even without valid data, to keep execution time consistent
      existingUser?.password ?? PASSWORD_STUB_HASH,
      password,
    );

    // Avoid precise error messages to limit information leakage
    if (
      !existingUser ||
      !passwordIsCorrect ||
      !existingUser.emailVerified ||
      // The user account is scheduled for deletion. The user can only register again after the deletion date.
      // Alternatively, the account can be restored so that the user can log in again.
      // Side note: it's impossible to guess the credentials of a deleted account as the email is random
      // and the password is not hashed, thus technically can't be compared against
      existingUser.deletedAt
    ) {
      throw new UnprocessableEntityException(
        "User either does not exist, password is incorrect or the email has not been verified yet.",
      );
    }

    return existingUser;
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async findUserByProvider(
    provider: FederationProvider,
    providerUserId: string,
  ) {
    return this.prisma.user.findFirst({
      where: {
        federatedUsers: {
          some: {
            provider,
            providerUserId,
          },
        },
      },
    });
  }
}
