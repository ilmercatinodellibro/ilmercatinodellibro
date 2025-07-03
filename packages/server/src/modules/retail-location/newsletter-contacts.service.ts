import {
  ContactsApi,
  ContactsApiApiKeys,
  type ErrorModel,
  type RequestContactImportJsonBodyInner,
} from "@getbrevo/brevo";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { BrevoConfiguration, brevoConfiguration } from "src/config/brevo";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { getPrismaRetailLocationFilters } from "src/modules/retail-location/retail-location.helpers";
import type { User } from "@prisma/client";

@Injectable()
export class NewsletterContactsService {
  private readonly logger = new Logger(NewsletterContactsService.name);
  private readonly brevoContactsApi = new ContactsApi();

  constructor(
    private readonly prisma: PrismaService,
    @Inject(brevoConfiguration.KEY)
    readonly brevoConfig: BrevoConfiguration,
  ) {
    this.brevoContactsApi.setApiKey(
      ContactsApiApiKeys.apiKey,
      brevoConfig.apiKey,
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateNewsletterContactsList() {
    // We pick 7 days ago because a part of the users will register only to sell books,
    // check if their books are sellable, then some time would pass before they actually
    // leave the books at the store, thus they would not result as active users in the last 24 hours
    // and they would be filtered out.
    // It's really difficult that a user registers, receive a newsletter and unsubscribes in less than 7 days,
    // so this is a good compromise to make sure we're actually sending the newsletter to all new registered users.
    // TODO: add a system which marks users as "active" after their first login using a given retail location
    const sevenDaysAgo = new Date(
      new Date().getTime() -
        // 7 days in ms
        7 * 24 * 60 * 60 * 1000,
    );

    const retailLocations = await this.prisma.retailLocation.findMany({
      select: {
        id: true,
        name: true,
        brevoContactsListId: true,
      },
    });

    for (const {
      id: retailLocationId,
      brevoContactsListId,
      name,
    } of retailLocations) {
      if (!brevoContactsListId) {
        this.logger.warn(
          `The Brevo contacts list ID is not set for location ${name}`,
        );
        continue;
      }

      const listId = parseInt(brevoContactsListId);
      if (isNaN(listId)) {
        this.logger.warn(
          `The provided Brevo contacts list ID isn't numeric and thus is invalid for location ${name}`,
        );
        continue;
      }

      const { activeUsersFilter } =
        getPrismaRetailLocationFilters(retailLocationId);

      const newOrUpdatedUsers = await this.prisma.user.findMany({
        where: {
          updatedAt: {
            gte: sevenDaysAgo,
          },
          emailVerified: true,
          ...activeUsersFilter,
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
          `No new/updated users in the past 7 days for location ${name}, skipping the update of the newsletter contacts list`,
        );
        return;
      }

      this.logger.log(
        `Updating the list of newsletter contacts for location ${name} - ${newOrUpdatedUsers.length} new/updated users in the past 7 days`,
      );

      try {
        await this.importContacts(newOrUpdatedUsers, listId);
      } catch (_error) {
        const error = _error as Error | { body: ErrorModel };
        const errorMessage =
          error instanceof Error ? error.message : error.body.message;

        this.logger.error(
          `Could not update the contact list for location ${name}: ${errorMessage}`,
        );
      }
    }
  }

  async importContacts(
    users: Pick<User, "firstname" | "lastname" | "email" | "phoneNumber">[],
    listId: number,
  ) {
    this.logger.log(
      `Uploading the user data to Brevo contact list with ID ${listId} `,
    );

    const { response } = await this.brevoContactsApi.importContacts({
      jsonBody: users.map(
        ({ email, phoneNumber, firstname, lastname }) =>
          ({
            email,
            attributes: {
              SMS: phoneNumber,
              FIRSTNAME: firstname,
              LASTNAME: lastname,
            },
          }) satisfies RequestContactImportJsonBodyInner,
      ),
      listIds: [listId],
    });

    if (response.statusCode !== 202) {
      throw new Error(`Invalid response status: ${response.statusMessage}`);
    }

    this.logger.log(`Update successful for list with ID ${listId}`);
  }
}
