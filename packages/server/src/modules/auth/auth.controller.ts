import { Controller, Get, Inject, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { RootConfiguration, rootConfiguration } from "src/config/root";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public-route.decorator";

export const EMAIL_VERIFICATION_ENDPOINT = "auth/email/verification";

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(rootConfiguration.KEY)
    private readonly rootConfig: RootConfiguration,
  ) {}

  @Public()
  @Get(`${EMAIL_VERIFICATION_ENDPOINT}/:token`)
  async validateEmail(@Param("token") token: string, @Res() res: Response) {
    await this.authService.validateEmailVerificationToken(token);

    // TODO: login the user automatically
    res.redirect(`${this.rootConfig.clientUrl}/login?emailVerified=true`);
  }
}
