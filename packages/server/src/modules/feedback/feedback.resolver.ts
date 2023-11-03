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
    private readonly mailerService: MailService,
  ) {}

  @Mutation(() => GraphQLVoid, { nullable: true })
  async feedback(
    @Input()
    { message, type }: FeedbackRequestPayload,
    @CurrentUser() { id: userId, firstname, lastname }: User,
  ) {
    const username = `${firstname} ${lastname}`;
    try {
      return await this.mailerService.sendMail({
        to: this.emailConfig.supportEmail,
        subject: `Feedback request (type: ${type}) from ${username} [${userId}] `,
        context: {
          name: username,
          message,
        },
        template: "feedback-request",
      });
    } catch {
      throw new UnprocessableEntityException("Unable to send email");
    }
  }
}
