import { type Brevo, BrevoClient } from "@getbrevo/brevo";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import type { UserModel } from "src/@generated/prisma/models.js";
import {
  type BrevoConfiguration,
  brevoConfiguration,
} from "src/config/brevo.js";
import { PrismaService } from "src/modules/prisma/prisma.service.js";
import { getPrismaRetailLocationFilters } from "src/modules/retail-location/retail-location.helpers.js";

@Injectable()
export class NewsletterContactsService {
  private readonly logger = new Logger(NewsletterContactsService.name);
  private readonly brevo: BrevoClient;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(brevoConfiguration.KEY)
    readonly brevoConfig: BrevoConfiguration,
  ) {
    this.brevo = new BrevoClient({ apiKey: brevoConfig.apiKey });
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
      Date.now() -
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

      const listId = Number.parseInt(brevoContactsListId);
      if (Number.isNaN(listId)) {
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
      } catch (error) {
        // BrevoError, thrown for responses with a non-2xx status, has the status and the response body in its message
        this.logger.error(
          `Could not update the contact list for location ${name}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  async importContacts(
    users: Pick<
      UserModel,
      "firstname" | "lastname" | "email" | "phoneNumber"
    >[],
    listId: number,
  ) {
    this.logger.log(
      `Uploading the user data to Brevo contact list with ID ${listId} `,
    );

    await this.brevo.contacts.importContacts({
      jsonBody: users.map(
        ({ email, phoneNumber, firstname, lastname }) =>
          ({
            email,
            attributes: {
              SMS: phoneNumber,
              FIRSTNAME: firstname,
              LASTNAME: lastname,
            },
          }) satisfies Brevo.ImportContactsRequest.JsonBody.Item,
      ),
      listIds: [listId],
    });

    this.logger.log(`Update successful for list with ID ${listId}`);
  }
}
