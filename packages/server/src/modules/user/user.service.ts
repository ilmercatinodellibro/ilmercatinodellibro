import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import * as argon2 from "argon2";
import { PASSWORD_STUB_HASH } from "prisma/factories/user";
import { RegisterPayload } from "src/modules/auth/auth.args";
import { PrismaService } from "src/modules/prisma/prisma.service";

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
    userData: Omit<RegisterPayload, "passwordConfirmation">,
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
    if (!existingUser || !passwordIsCorrect || !existingUser.emailVerified) {
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
}
