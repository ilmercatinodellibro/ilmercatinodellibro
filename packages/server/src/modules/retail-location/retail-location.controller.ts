import { createReadStream } from "node:fs";
import { rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  Controller,
  Get,
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
import { AuthService } from "src/modules/auth/auth.service";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { Public } from "src/modules/auth/decorators/public-route.decorator";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { RetailLocationService } from "src/modules/retail-location/retail-location.service";
import { Theme } from "src/modules/retail-location/theme.args";

@Controller()
export class RetailLocationController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly locationService: RetailLocationService,
  ) {}

  @Get("/location/:id/logo/:name")
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

  @Put("/location/:id/logo")
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
}
