import {
  Controller,
  Get,
  Inject,
  Param,
  Res,
  forwardRef,
} from "@nestjs/common";
import { Response } from "express";
import { RootConfiguration, rootConfiguration } from "src/config/root";
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

    // TODO: login the user automatically
    res.redirect(`${this.rootConfig.clientUrl}/login?emailVerified=true`);
  }
}
