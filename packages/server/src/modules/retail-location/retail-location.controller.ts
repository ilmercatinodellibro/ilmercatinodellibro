import { createReadStream, writeFileSync } from "node:fs";
import { rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  Controller,
  Get,
  Header,
  Inject,
  NotFoundException,
  Param,
  Put,
  StreamableFile,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Prisma, Role, User } from "@prisma/client";
import { upperCase } from "lodash";
import { rootConfiguration, type RootConfiguration } from "src/config/root";
import { AuthService } from "src/modules/auth/auth.service";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { Public } from "src/modules/auth/decorators/public-route.decorator";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { getPrismaRetailLocationFilters } from "src/modules/retail-location/retail-location.helpers";
import { RetailLocationService } from "src/modules/retail-location/retail-location.service";
import { Theme } from "src/modules/retail-location/theme.args";

@Controller("location")
export class RetailLocationController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly locationService: RetailLocationService,
    @Inject(rootConfiguration.KEY)
    private readonly rootConfig: RootConfiguration,
  ) {}

  @Get(":id/logo/:name")
  @Public()
  async getRetailLocationLogo(
    @Param("id") locationId: string,
    @Param("name") logoName: string,
  ) {
    const { theme } = await this.prisma.retailLocation.findUniqueOrThrow({
      where: {
        id: locationId,
      },
      select: {
        theme: true,
      },
    });
    const logoPath = (theme as unknown as Theme).logo;
    if (!logoPath) {
      throw new NotFoundException("No logo found for this location");
    }
    if (!logoPath.endsWith(logoName)) {
      throw new NotFoundException("Logo not found");
    }

    const extension = logoPath
      .split(".")
      .at(-1) as keyof typeof this.extensionMimeTypeMap;

    return new StreamableFile(
      createReadStream(resolve(this.getLogoDirectory(locationId), logoName)),
      {
        type: this.extensionMimeTypeMap[extension],
      },
    );
  }

  @Put(":id/logo")
  @UseInterceptors(FileInterceptor("file"))
  async uploadRetailLocationLogo(
    @Param("id") retailLocationId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    const location = await this.prisma.retailLocation.findUniqueOrThrow({
      where: {
        id: retailLocationId,
      },
    });
    await this.authService.assertMembership({
      userId: user.id,
      retailLocationId: location.id,
      role: Role.ADMIN,
    });

    if (!(file.mimetype in this.mimeTypeExtensionMap)) {
      throw new UnprocessableEntityException(
        "Invalid file type. Allowed types are: " +
          Object.keys(this.mimeTypeExtensionMap).join(", "),
      );
    }

    const extension =
      this.mimeTypeExtensionMap[
        file.mimetype as keyof typeof this.mimeTypeExtensionMap
      ];
    const logoDirectory = this.getLogoDirectory(retailLocationId);
    const logoFileName = `logo.${extension}`;
    const logoPath = resolve(logoDirectory, logoFileName);
    await writeFile(logoPath, file.buffer);

    await Promise.all(
      Object.values(this.mimeTypeExtensionMap)
        .filter((ext) => ext !== extension)
        .map((ext) =>
          rm(resolve(logoDirectory, `./logo.${ext}`), { force: true }),
        ),
    );

    await this.prisma.retailLocation.update({
      where: {
        id: retailLocationId,
      },
      data: {
        theme: {
          // eslint-disable-next-line @typescript-eslint/no-misused-spread
          ...(location.theme as unknown as Theme),
          logo: logoFileName,
        } as unknown as Prisma.InputJsonObject,
      },
    });
  }

  private readonly mimeTypeExtensionMap = {
    "image/svg+xml": "svg",
    "image/png": "png",
  } as const;
  private readonly extensionMimeTypeMap = {
    svg: "image/svg+xml",
    png: "image/png",
  } as const;

  private getLogoDirectory(locationId: string) {
    return this.locationService.resolveStoragePath(locationId, "./logo");
  }

  @Get(":id/export-active-users")
  @Header("Content-Type", "text/csv")
  async exportActiveUsers(
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
