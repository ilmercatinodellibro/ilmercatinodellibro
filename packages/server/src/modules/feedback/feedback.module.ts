import { Module } from "@nestjs/common";
import { MailModule } from "../mail/mail.module";
import { FeedbackResolver } from "./feedback.resolver";

@Module({
  imports: [MailModule],
  providers: [FeedbackResolver],
})
export class FeedbackModule {}
