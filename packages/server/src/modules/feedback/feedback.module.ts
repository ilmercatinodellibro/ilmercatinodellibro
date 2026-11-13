import { Module } from "@nestjs/common";
import { MailModule } from "../mail/mail.module.js";
import { FeedbackResolver } from "./feedback.resolver.js";

@Module({
  imports: [MailModule],
  providers: [FeedbackResolver],
})
export class FeedbackModule {}
