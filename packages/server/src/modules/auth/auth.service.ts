import {
  ForbiddenException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import { JwtService, TokenExpiredError } from "@nestjs/jwt";
import { Role } from "src/@generated/prisma/enums.js";
import type { UserModel } from "src/@generated/prisma/models.js";
import { type RootConfiguration, rootConfiguration } from "src/config/root.js";
import { MailService } from "../mail/mail.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { UserService } from "../user/user.service.js";
import { VERIFICATION_TOKEN_EXPIRATION_TIME } from "./strategies/jwt.strategy.js";

interface VerificationTokenPayload {
  email: string;
  locationId: string;
}

interface SendInvitePayload {
  toEmail: string;
  invitedBy: UserModel;
  token: string;
  locationId: string;
  locale: string;
}

export const EMAIL_VERIFICATION_ENDPOINT = "auth/email/verification";

@Injectable()
export class AuthService {
  // eslint-disable-next-line @typescript-eslint/max-params -- NestJS injects each dependency as a constructor parameter
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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
        throw new Error("The user doesn't have the required role");
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
      if (role !== Role.ADMIN) {
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
      return await this.mailService.sendMail({
        to: toEmail,
        subject:
          locale === "en-US"
            ? "Invitation to join Il Mercatino del Libro"
            : "Invito a registrarsi su Il Mercatino del Libro",
        context: {
          invitedByName: `${invitedBy.firstname} ${invitedBy.lastname}`,
          url,
        },
        template: "invite-user",
        retailLocationId: locationId,
        locale,
      });
    } catch {
      throw new UnprocessableEntityException("Unable to send email");
    }
  }

  async sendVerificationLink(
    locationId: string,
    user: UserModel,
    token: string,
  ) {
    const url = `${this.rootConfig.serverUrl}/${EMAIL_VERIFICATION_ENDPOINT}?locationId=${locationId}&token=${token}`;

    try {
      return await this.mailService.sendMail({
        to: user,
        subject:
          user.locale === "en-US" ? "Email verification" : "Verifica email",
        context: {
          name: `${user.firstname} ${user.lastname}`,
          url,
        },
        template: "welcome",
        retailLocationId: locationId,
        locale: user.locale,
      });
    } catch {
      throw new UnprocessableEntityException(
        "Unable to send verification email",
      );
    }
  }

  async sendPasswordResetLink(
    locationId: string,
    user: UserModel,
    token: string,
  ) {
    // Make sure the URL below is in sync with `AvailableRouteNames.ChangePassword` in the client project
    const url = `${this.rootConfig.clientUrl}/${locationId}/change-password?token=${token}`;

    try {
      return await this.mailService.sendMail({
        to: user,
        subject:
          user.locale === "en-US" ? "Reset password" : "Reimposta password",
        context: {
          name: `${user.firstname} ${user.lastname}`,
          url,
        },
        template: "forgot-password",
        retailLocationId: locationId,
        locale: user.locale,
      });
    } catch {
      throw new UnprocessableEntityException("Unable to send email");
    }
  }

  async validateEmailVerificationToken(token: string) {
    let payload: VerificationTokenPayload;
    let isExpired = false;

    try {
      payload = this.jwtService.verify<VerificationTokenPayload>(token);
    } catch (error) {
      if (!(error instanceof TokenExpiredError)) {
        throw new UnprocessableEntityException(
          "Verification token is not valid",
        );
      }

      isExpired = true;
      // The signature is checked before the expiration, so the payload of an expired token can be trusted
      payload = this.jwtService.decode<VerificationTokenPayload>(token);
    }

    const { email, locationId } = payload;
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new UnprocessableEntityException("User does not exist");
    }

    if (user.emailVerified) {
      throw new UnprocessableEntityException("Email has already been verified");
    }

    if (isExpired) {
      const newToken = this.createVerificationToken(locationId, user.email);
      await this.sendVerificationLink(locationId, user, newToken);
      throw new UnprocessableEntityException(
        "Verification token Expired. We sent you a new verification link, please check your inbox.",
      );
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
