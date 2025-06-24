import { type ErrorModel } from "@getbrevo/brevo";
import { Logger } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { NewsletterContactsService } from "src/modules/user/newsletter-contacts.service";

@Command({
  name: "upload-users",
  description:
    "Uploads all the current users with a verified email address to Brevo newsletter as a CSV",
})
export class UploadUsersCommand extends CommandRunner {
  private readonly logger = new Logger(UploadUsersCommand.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly newsletterContactsService: NewsletterContactsService,
  ) {
    super();
  }

  async run() {
    const users = await this.prisma.user.findMany({
      where: { emailVerified: true },
      distinct: "email",
      select: {
        id: true,
        firstname: true,
        email: true,
        lastname: true,
        locale: true,
      },
    });

    try {
      await this.newsletterContactsService.importContacts(users);

      this.logger.log("Contacts uploaded successfully");
    } catch (_error) {
      const error = _error as Error | { body: ErrorModel };
      this.logger.error(
        `Error while uploading the contacts: ${error instanceof Error ? error.message : error.body.message}`,
      );
    }
  }
}
