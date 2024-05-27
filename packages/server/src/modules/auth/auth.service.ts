import {
  ForbiddenException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
// "jsonwebtoken" is a "@nestjs/jwt" transitive dependency, which reference directly because "@nestjs/jwt" don't re-export the error class
// Adding the dependency to our package.json is a risk as it could break our code in a subtle way if upstream transitive dependency is upgraded
import { Role, User } from "@prisma/client";
import { TokenExpiredError } from "jsonwebtoken";
import { RootConfiguration, rootConfiguration } from "src/config/root";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";
import { UserService } from "../user/user.service";
import { EMAIL_VERIFICATION_ENDPOINT } from "./auth.controller";
import { VERIFICATION_TOKEN_EXPIRATION_TIME } from "./strategies/jwt.strategy";

interface VerificationTokenPayload {
  email: string;
  locationId: string;
}

interface SendInvitePayload {
  toEmail: string;
  invitedBy: User;
  token: string;
  locationId: string;
  locale: string;
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

  createVerificationToken(locationId: string, email: string) {
    return this.jwtService.sign(
      {
        locationId,
        email,
      } satisfies VerificationTokenPayload,
      {
        expiresIn: VERIFICATION_TOKEN_EXPIRATION_TIME,
      },
    );
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

  async sendInviteLink({
    toEmail,
    invitedBy,
    locationId,
    token,
    locale,
  }: SendInvitePayload) {
    const url = `${this.rootConfig.clientUrl}/${locationId}/invite?token=${token}&email=${toEmail}`;

    try {
      return await this.mailerService.sendMail({
        subject:
          locale === "en-US"
            ? "Invitation to join Il Mercatino del Libro"
            : "Invito a unirsi a Il Mercatino del Libro",
        to: toEmail,
        context: {
          invitedByName: `${invitedBy.firstname} ${invitedBy.lastname}`,
          url,
        },
        template: `${locale}/invite-user`,
      });
    } catch {
      throw new UnprocessableEntityException("Unable to send email");
    }
  }

  async sendVerificationLink(locationId: string, user: User, token: string) {
    const url = `${this.rootConfig.serverUrl}/${EMAIL_VERIFICATION_ENDPOINT}?locationId=${locationId}&token=${token}`;
    const locale = user.locale ?? "it";

    try {
      return await this.mailerService.sendMail({
        to: user.email,
        subject: locale === "en-US" ? "Email confirmation" : "Conferma email",
        context: {
          name: `${user.firstname} ${user.lastname}`,
          url,
        },
        template: `${locale}/welcome`,
      });
    } catch {
      throw new UnprocessableEntityException("Unable to send email");
    }
  }

  async sendPasswordResetLink(locationId: string, user: User, token: string) {
    // Make sure the URL below is in sync with `AvailableRouteNames.ChangePassword` in the client project
    const url = `${this.rootConfig.clientUrl}/${locationId}/change-password?token=${token}`;
    const locale = user.locale ?? "it";

    try {
      return await this.mailerService.sendMail({
        to: user.email,
        subject: locale === "en-US" ? "Reset password" : "Reimposta password",
        context: {
          name: `${user.firstname} ${user.lastname}`,
          url,
        },
        template: `${locale}/forgot-password`,
      });
    } catch {
      throw new UnprocessableEntityException("Unable to send email");
    }
  }

  async validateEmailVerificationToken(token: string) {
    const { email, locationId } = this.jwtService.decode(
      token,
    ) as VerificationTokenPayload;
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new UnprocessableEntityException("User does not exist");
    }

    if (user.emailVerified) {
      throw new UnprocessableEntityException("Email has already been verified");
    }

    try {
      this.jwtService.verify(token);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        const token = this.createVerificationToken(locationId, user.email);
        await this.sendVerificationLink(locationId, user, token);
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
