import { createReadStream, writeFileSync } from "fs";
import { join } from "path";
import { Controller, Get, Header, StreamableFile } from "@nestjs/common";
import { Role, type User } from "@prisma/client";
import { AuthService } from "src/modules/auth/auth.service";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { PrismaService } from "src/modules/prisma/prisma.service";

const contactsCsvFilePath = "storage/tmp/CONTACTS_LIST.csv";

@Controller("users")
export class UserController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @Get("export-csv")
  @Header("Content-Type", "text/csv")
  async getUsersCSV(@CurrentUser() currentUser: User) {
    await this.authService.assertMembership({
      userId: currentUser.id,
      message: "Forbidden access",
      role: Role.ADMIN,
    });

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

    let csvBody = users
      .map((user) => {
        const userDataCsvRow = Object.values(user)
          .map((value) => value ?? "null")
          .join(",");

        return userDataCsvRow;
      })
      .join("\n");

    const csvHeader = Object.keys(users[0]).join(",");
    csvBody = `${csvHeader}\n${csvBody}`;

    writeFileSync(contactsCsvFilePath, csvBody);

    const file = createReadStream(join(process.cwd(), contactsCsvFilePath));

    return new StreamableFile(file, {
      type: "text/csv",
    });
  }
}
