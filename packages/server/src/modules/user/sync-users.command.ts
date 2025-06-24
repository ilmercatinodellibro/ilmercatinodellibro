import { readFileSync, writeFileSync } from "fs";
import { env } from "process";
import {
  ContactsApi,
  ContactsApiApiKeys,
  type ErrorModel,
} from "@getbrevo/brevo";
import { Logger } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";
import { PrismaService } from "src/modules/prisma/prisma.service";

@Command({
  name: "sync-users",
  description: "Uploads the current user list to Brevo newsletter as a CSV",
})
export class SyncUsersCommand extends CommandRunner {
  private readonly logger = new Logger(SyncUsersCommand.name);
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async run() {
    const users = await this.prisma.user.findMany({
      where: { emailVerified: true },
      distinct: "email",
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        locale: true,
      },
    });

    const filePath = `storage/tmp/NEWSLETTER_USER_DATA.csv`;
    const csvHeader = Object.keys(users[0]).join(",");
    const csvBody = users
      .map((user) =>
        Object.values(user)
          .map((value) => value ?? "null")
          .join(","),
      )
      .join("\n");

    try {
      writeFileSync(filePath, `${csvHeader}\n${csvBody}`);

      const fileBody = readFileSync(filePath).toString();
      const apiKey = env.BREVO_API_KEY;
      if (apiKey === undefined) {
        throw new Error("Missing API key in env config");
      }

      const brevoApi = new ContactsApi();
      brevoApi.setApiKey(ContactsApiApiKeys.apiKey, apiKey);

      const { response } = await brevoApi.importContacts({
        fileBody,
        listIds: [3],
      });

      if (response.statusCode !== 202) {
        throw new Error(`Invalid response status: ${response.statusMessage}`);
      }

      this.logger.log("Contacts imported successfully");
    } catch (_error) {
      const error = _error as { body: ErrorModel };
      this.logger.error(
        `Error while uploading the contacts: ${error.body.message}`,
      );
    }
  }
}
