import { Inject, UnprocessableEntityException } from "@nestjs/common";
import { Mutation, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";
import { User } from "src/@generated";
import { EmailConfiguration, emailConfiguration } from "src/config/email";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
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

  @Mutation(() => GraphQLVoid, { nullable: true })
  async feedback(
    @Input() { message, type }: FeedbackRequestPayload,
    @CurrentUser() { id: userId, firstname, lastname, locale = "it" }: User,
  ) {
    const username = `${firstname} ${lastname}`;
    try {
      return await this.mailService.sendMail({
        to: this.emailConfig.supportEmail,
        subject:
          locale === "en-US"
            ? `Feedback request (type: ${type}) from ${username} [${userId}]`
            : `Richiesta di feedback (tipo: ${type}) da ${username} [${userId}]`,
        context: {
          name: username,
          message,
        },
        template: `${locale}/feedback-request`,
      });
    } catch {
      throw new UnprocessableEntityException("Unable to send email");
    }
  }
}
