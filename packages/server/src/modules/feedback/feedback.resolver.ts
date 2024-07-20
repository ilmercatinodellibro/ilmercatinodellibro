import { Inject, UnprocessableEntityException } from "@nestjs/common";
import { Mutation, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";
import { EmailConfiguration, emailConfiguration } from "src/config/email";
import { Public } from "src/modules/auth/decorators/public-route.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { MailService } from "../mail/mail.service";
import { FeedbackRequestPayload } from "./feedback.args";

@Resolver()
export class FeedbackResolver {
  constructor(
    @Inject(emailConfiguration.KEY)
    private readonly emailConfig: EmailConfiguration,
    private readonly mailService: MailService,
  ) {}

  @Public()
  @Mutation(() => GraphQLVoid, { nullable: true })
  async feedback(
    @Input()
    { firstname, lastname, email, message, locale }: FeedbackRequestPayload,
  ) {
    const fullName = `${firstname} ${lastname}`;
    try {
      return await this.mailService.sendMail({
        to: this.emailConfig.supportEmail,
        from: email,
        subject:
          locale === "en-US"
            ? `Contact request from ${fullName}`
            : `Richiesta di contatto da ${fullName}`,
        context: {
          name: fullName,
          message,
        },
        template: "feedback-request",
        locale,
      });
    } catch {
      throw new UnprocessableEntityException("Unable to send email");
    }
  }
}
