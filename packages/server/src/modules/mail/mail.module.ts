import { join } from "node:path";
import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { EjsAdapter } from "@nestjs-modules/mailer/adapters/ejs.adapter";
import { Options as EjsOptions } from "ejs";
import { EmailConfiguration, emailConfiguration } from "src/config/email.js";
import { MailService } from "./mail.service.js";

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (emailConfiguration: EmailConfiguration) => ({
        transport: {
          host: emailConfiguration.host,
          port: emailConfiguration.port,
          secure: emailConfiguration.isSecure,
          auth: {
            user: emailConfiguration.user,
            pass: emailConfiguration.pass,
          },
        },
        defaults: {
          from: emailConfiguration.fromDefault,
        },
        template: {
          dir: join(import.meta.dirname, "templates"),
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          } satisfies EjsOptions,
        },
      }),
      inject: [emailConfiguration.KEY],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
