import { appendFileSync, existsSync, readFileSync } from "fs";
import {
  ContactsApi,
  ContactsApiApiKeys,
  type ErrorModel,
} from "@getbrevo/brevo";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "src/modules/prisma/prisma.service";
import type { User } from "@prisma/client";
import type { IncomingMessage } from "http";

@Injectable()
export class NewsletterContactsService {
  private readonly logger = new Logger(NewsletterContactsService.name);
  private readonly brevoContactsApi = new ContactsApi();
  private readonly contactsCsvFilePath = `storage/tmp/NEWSLETTER_USER_DATA.csv`;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error("Missing API key in the configuration");
    }

    this.brevoContactsApi.setApiKey(ContactsApiApiKeys.apiKey, apiKey);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async updateNewsletterContactsList() {
    const oneDayAgo =
      new Date().getTime() -
      // 1 day in ms
      24 * 60 * 60 * 1000;

    const newOrUpdatedUsers = await this.prisma.user.findMany({
      where: {
        updatedAt: {
          gte: new Date(oneDayAgo),
        },
        emailVerified: true,
      },
      select: {
        id: true,
        firstname: true,
        email: true,
        lastname: true,
        locale: true,
      },
    });

    if (newOrUpdatedUsers.length === 0) {
      this.logger.log(
        "No new/updated users in the past 24 hours, skipping the update of the newsletter contacts list",
      );
      return;
    }

    this.logger.log(
      `Updating the list of newsletter contacts - ${newOrUpdatedUsers.length} new/updated users in the past 24hrs`,
    );

    try {
      await this.importContacts(newOrUpdatedUsers);
    } catch (_error) {
      const error = _error as Error | { body: ErrorModel };
      this.logger.error(
        `Could not update the contact list: ${error instanceof Error ? error.message : error.body.message}`,
      );
    }
  }

  async importContacts(
    users: Pick<User, "id" | "firstname" | "lastname" | "locale" | "email">[],
  ) {
    let csvBody = users
      .map((user) => {
        const userDataCsvRow = Object.values(user)
          .map((value) => value ?? "null")
          .join(",");

        return userDataCsvRow;
      })
      .join("\n");

    const isUpdatingCsv = existsSync(this.contactsCsvFilePath);
    this.logger.log(
      `${isUpdatingCsv ? "Updating" : "Creating"} the contacts list CSV`,
    );

    let csvHeader = "";
    if (!isUpdatingCsv) {
      csvHeader = Object.keys(users[0]).join(",");
    }
    csvBody = `${csvHeader}\n${csvBody}`;

    appendFileSync(this.contactsCsvFilePath, csvBody);

    const fullPath = `${process.cwd()}/${this.contactsCsvFilePath}`;
    this.logger.log(
      `CSV file ${isUpdatingCsv ? "updated" : "created"} successfully at the path ${fullPath}`,
    );

    const fileBody = readFileSync(this.contactsCsvFilePath).toString();

    const listId = process.env.BREVO_CONTACTS_LIST_ID;
    if (!listId) {
      throw new Error("Missing contacts list ID in the configuration");
    }

    this.logger.log(
      `${isUpdatingCsv ? "Updating" : "Uploading"} the CSV to Brevo contact list`,
    );

    const { response } = await new Promise<{
      response: Partial<IncomingMessage>;
    }>((resolve) => {
      this.logger.debug("Fake API communication");
      resolve({ response: { statusCode: 202, statusMessage: fileBody[0] } });
    });
    // await this.brevoContactsApi.importContacts({
    //   fileBody,
    //   listIds: [parseInt(listId)],
    // });

    if (response.statusCode !== 202) {
      throw new Error(`Invalid response status: ${response.statusMessage}`);
    }
  }
}
