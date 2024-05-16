import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  forwardRef,
} from "@nestjs/common";
import { User } from "@prisma/client";
import { Request, Response } from "express";
import { RootConfiguration, rootConfiguration } from "src/config/root";
import { FacebookAuthGuard } from "src/modules/auth/guards/facebook.guard";
import { GoogleAuthGuard } from "src/modules/auth/guards/google.guard";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public-route.decorator";

export const EMAIL_VERIFICATION_ENDPOINT = "auth/email/verification";

@Controller()
export class AuthController {
  constructor(
    // The circular dependency between AuthModule and UserModule is solved at the module level by using `forwardRef`
    // But, this one case below needed to be solved at the injection level for some reason (maybe controllers work differently?)
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(rootConfiguration.KEY)
    private readonly rootConfig: RootConfiguration,
  ) {}

  @Public()
  @Get(`${EMAIL_VERIFICATION_ENDPOINT}/:token`)
  async validateEmail(@Param("token") token: string, @Res() res: Response) {
    await this.authService.validateEmailVerificationToken(token);

    // TODO: involve location id
    // TODO: login the user automatically
    res.redirect(`${this.rootConfig.clientUrl}/login?emailVerified=true`);
  }

  @Public()
  @UseGuards(FacebookAuthGuard)
  @Get("auth/facebook")
  loginWithFacebook(
    // Utilized in FacebookAuthGuard.authenticate
    @Query("locationId") _locationId: string,
  ) {
    // The auth guard will make this endpoint redirect to Facebook
  }

  // After completing the login on Facebook, it will redirect the user to this endpoint
  @Public()
  @UseGuards(FacebookAuthGuard)
  @Get("auth/facebook/callback")
  facebookAuthCallback(@Req() request: Request, @Res() res: Response) {
    const user = request.user as User | undefined;
    if (!user) {
      throw new ForbiddenException();
    }

    const locationId = request.query.state as string;

    const jwt = this.authService.createAccessToken(user.id);
    res.redirect(
      `${this.rootConfig.clientUrl}/${locationId}/login/social?token=${jwt}`,
    );
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get("auth/google")
  loginWithGoogle(
    // Utilized in GoogleAuthGuard.authenticate
    @Query("locationId") _locationId: string,
  ) {
    // The auth guard will make this endpoint redirect to Google
  }

  // After completing the login on Google, it will redirect the user to this endpoint
  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get("auth/google/callback")
  googleAuthCallback(@Req() request: Request, @Res() res: Response) {
    const user = request.user as User | undefined;
    if (!user) {
      throw new ForbiddenException();
    }

    const locationId = request.query.state as string;

    const jwt = this.authService.createAccessToken(user.id);
    res.redirect(
      `${this.rootConfig.clientUrl}/${locationId}/login/social?token=${jwt}`,
    );
  }
}
