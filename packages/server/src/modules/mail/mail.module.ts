import { join } from "node:path";
import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { EjsAdapter } from "@nestjs-modules/mailer/dist/adapters/ejs.adapter";
import { EmailConfiguration, emailConfiguration } from "src/config/email";
import { MailService } from "./mail.service";

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (emailConfiguration: EmailConfiguration) => ({
        transport: {
          host: emailConfiguration.host,
          port: emailConfiguration.port,
          secure: false,
          auth: {
            user: emailConfiguration.user,
            pass: emailConfiguration.pass,
          },
        },
        defaults: {
          from: `"Support - No Reply" <${emailConfiguration.fromDefault}>`,
        },
        template: {
          dir: join(__dirname, "templates"),
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
      inject: [emailConfiguration.KEY],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
