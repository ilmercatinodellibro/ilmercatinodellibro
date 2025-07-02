import { createReadStream, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  Controller,
  Get,
  Header,
  Inject,
  Param,
  StreamableFile,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Role, type User } from "@prisma/client";
import { upperCase } from "lodash";
import { RootConfiguration, rootConfiguration } from "src/config/root";
import { AuthService } from "src/modules/auth/auth.service";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { getPrismaRetailLocationFilters } from "src/modules/retail-location/retail-location.helpers";

@Controller("users")
export class UserController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    @Inject(rootConfiguration.KEY)
    private readonly rootConfig: RootConfiguration,
  ) {}

  @Get("export-csv/:id")
  @Header("Content-Type", "text/csv")
  async getUsersCSV(
    @Param("id") retailLocationId: string,
    @CurrentUser() currentUser: User,
  ) {
    await this.authService.assertMembership({
      userId: currentUser.id,
      message: "Forbidden access",
      role: Role.ADMIN,
    });

    const { activeUsersFilter } =
      getPrismaRetailLocationFilters(retailLocationId);

    const users = await this.prisma.user.findMany({
      where: { emailVerified: true, ...activeUsersFilter },
      select: {
        firstname: true,
        lastname: true,
        email: true,
        phoneNumber: true,
      },
    });

    if (users.length === 0) {
      throw new UnprocessableEntityException(
        "No active users found for the specified retail location.",
      );
    }

    const csvHeader = Object.keys(users[0])
      .map((value) => upperCase(value))
      .join(",");
    const csvBody = users
      .map((user) =>
        Object.values(user)
          // Wrap values in double quotes to handle special characters
          .map((value) => `"${value}"`)
          .join(","),
      )
      .join("\n");

    const filePath = this.#resolveContactsCsvFilePath(retailLocationId);

    writeFileSync(filePath, `${csvHeader}\n${csvBody}`);

    return new StreamableFile(createReadStream(filePath));
  }

  #resolveContactsCsvFilePath(locationId: string) {
    return resolve(
      this.rootConfig.storagePath,
      `./location/${locationId}/user_list_${locationId}.csv`,
    );
  }
}
