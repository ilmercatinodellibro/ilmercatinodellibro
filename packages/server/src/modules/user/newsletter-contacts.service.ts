import {
  ContactsApi,
  ContactsApiApiKeys,
  type ErrorModel,
} from "@getbrevo/brevo";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "src/modules/prisma/prisma.service";
import type { User } from "@prisma/client";

@Injectable()
export class NewsletterContactsService {
  private readonly logger = new Logger(NewsletterContactsService.name);
  private readonly brevoContactsApi = new ContactsApi();

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error("Missing API key in the configuration");
    }

    this.brevoContactsApi.setApiKey(ContactsApiApiKeys.apiKey, apiKey);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
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
        firstname: true,
        lastname: true,
        email: true,
        phoneNumber: true,
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

    const retailLocationData = await this.prisma.retailLocation.findMany({
      select: {
        brevoContactsListId: true,
        name: true,
      },
    });

    for (const { brevoContactsListId, name } of retailLocationData) {
      try {
        if (brevoContactsListId === "") {
          // The list ID for this retail location was not set, so we skip it
          throw new Error(`The ID is not set for this location.`);
        }

        await this.importContacts(newOrUpdatedUsers, brevoContactsListId);
      } catch (_error) {
        const error = _error as Error | { body: ErrorModel };
        this.logger.error(
          `Could not update the contact list for ${name}: ${error instanceof Error ? error.message : error.body.message}`,
        );
      }
    }
  }

  async importContacts(
    jsonBody: Pick<User, "firstname" | "lastname" | "email" | "phoneNumber">[],
    listId: string,
  ) {
    this.logger.log("Uploading the user data to Brevo contact list");

    const { response } = await this.brevoContactsApi.importContacts({
      jsonBody,
      listIds: [parseInt(listId)],
    });

    if (response.statusCode !== 202) {
      throw new Error(`Invalid response status: ${response.statusMessage}`);
    }
  }
}
