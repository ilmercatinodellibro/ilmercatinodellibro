import {
  ForbiddenException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
// "jsonwebtoken" is a "@nestjs/jwt" transitive dependency, which reference directly because "@nestjs/jwt" don't re-export the error class
// Adding the dependency to our package.json is a risk as it could break our code in a subtle way if upstream transitive dependency is upgraded
import { Role } from "@prisma/client";
import { TokenExpiredError } from "jsonwebtoken";
import { RootConfiguration, rootConfiguration } from "src/config/root";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";
import { UserService } from "../user/user.service";
import { EMAIL_VERIFICATION_ENDPOINT } from "./auth.controller";
import { VERIFICATION_TOKEN_EXPIRATION_TIME } from "./strategies/jwt.strategy";

interface DecodedVerificationPayload {
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailService,
    private readonly userService: UserService,
    @Inject(rootConfiguration.KEY)
    private readonly rootConfig: RootConfiguration,
  ) {}

  createAccessToken(userId: string): string {
    return this.jwtService.sign({}, { subject: userId });
  }

  createVerificationToken(email: string) {
    const payload = { email };
    const token = this.jwtService.sign(payload, {
      expiresIn: VERIFICATION_TOKEN_EXPIRATION_TIME,
    });
    return token;
  }

  async assertMembership(options: {
    userId: string;
    retailLocationId?: string;
    role?: Role;
    message?: string;
  }) {
    try {
      const { role } = await this.prisma.locationMember.findFirstOrThrow({
        where: {
          userId: options.userId,
          retailLocationId: options.retailLocationId,
        },
        select: {
          role: true,
        },
      });
      if (options.role !== undefined && role !== options.role) {
        throw new Error();
      }
    } catch {
      throw new ForbiddenException(options.message);
    }
  }

  async userIsAdmin(
    userId: string,
    retailLocationId: string,
  ): Promise<boolean> {
    try {
      const { role } = await this.prisma.locationMember.findFirstOrThrow({
        where: {
          userId,
          retailLocationId,
        },
        select: {
          role: true,
        },
      });
      if (role !== "ADMIN") {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  async sendInviteLink(email: string, name: string, token: string) {
    const url = `${this.rootConfig.clientUrl}/invite?token=${token}&email=${email}`;

    try {
      return await this.mailerService.sendMail({
        subject: "Invitation to join Il Mercatino del Libro",
        to: email,
        context: {
          name,
          url,
        },
        template: "invite-user",
      });
    } catch {
      throw new UnprocessableEntityException("Unable to send email");
    }
  }

  async sendVerificationLink(email: string, token: string) {
    const url = `${this.rootConfig.serverUrl}/${EMAIL_VERIFICATION_ENDPOINT}/${token}`;

    try {
      return await this.mailerService.sendMail({
        to: email,
        subject: "Email confirmation",
        context: {
          name: "user",
          url,
        },
        template: "welcome",
      });
    } catch {
      throw new UnprocessableEntityException("Unable to send email");
    }
  }

  async sendPasswordResetLink(email: string, token: string) {
    // Make sure the URL below is in sync with `AvailableRouteNames.ChangePassword` in the client project
    const url = `${this.rootConfig.clientUrl}/change-password?token=${token}`;

    try {
      return await this.mailerService.sendMail({
        to: email,
        subject: "Reset password",
        context: {
          name: "user",
          url,
        },
        template: "forgot-password",
      });
    } catch {
      throw new UnprocessableEntityException("Unable to send email");
    }
  }

  async validateEmailVerificationToken(token: string) {
    const userPayload = this.jwtService.decode(
      token,
    ) as DecodedVerificationPayload;
    const user = await this.userService.findUserByEmail(userPayload.email);

    if (!user) {
      throw new UnprocessableEntityException("User does not exist");
    }

    if (user.emailVerified) {
      throw new UnprocessableEntityException("Email has already been verified");
    }

    try {
      this.jwtService.verify(token);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        const token = this.createVerificationToken(user.email);
        await this.sendVerificationLink(user.email, token);
        throw new UnprocessableEntityException(
          "Verification token Expired. We sent you a new verification link, please check your inbox.",
        );
      }
    }
    return this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: true,
      },
    });
  }
}
