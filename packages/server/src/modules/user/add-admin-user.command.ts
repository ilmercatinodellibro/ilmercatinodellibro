import { Logger } from "@nestjs/common";
import { Role, User } from "@prisma/client";
import { Command, CommandRunner } from "nest-commander";
import { PrismaService } from "src/modules/prisma/prisma.service";
import retailLocations from "test/fixtures/retail-locations";

const adminData: Pick<User, "email" | "password" | "firstname" | "lastname"> = {
  email: "info@ilmercatinodellibro.com",
  password:
    "$argon2id$v=19$m=65536,t=3,p=4$Ae3q36sm3zzXuh9IOFigaA$orXmayUt1IKLZC8TXGPXdb2osyBzZspVToEmeMYgvU8",
  firstname: "Il Mercatino del Libro",
  lastname: "",
};

@Command({
  name: "add-admin",
  description:
    "Adds the default admin user inside the DB if not already present.",
})
export class AddAdminUserCommand extends CommandRunner {
  private readonly logger = new Logger(AddAdminUserCommand.name);
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async run(_: string[]): Promise<void> {
    const currentAdmin = await this.prisma.user.findUnique({
      where: {
        ...adminData,
      },
      include: {
        memberships: true,
      },
    });

    if (currentAdmin) {
      this.logger.log("The admin user already exists");

      const membershipsToAdd = retailLocations.filter(
        ({ id }) =>
          !currentAdmin.memberships.find(
            ({ retailLocationId, role }) =>
              retailLocationId === id && role === Role.ADMIN,
          ),
      );

      if (membershipsToAdd.length === 0) {
        this.logger.log("The roles and permissions are already correctly set");
        return;
      }

      this.logger.log(
        "The current admin doesn't have correct permissions.\nRestoring roles and permissions....",
      );

      await this.prisma.locationMember.deleteMany({
        where: {
          userId: currentAdmin.id,
          role: {
            not: Role.ADMIN,
          },
        },
      });
      await this.prisma.locationMember.createMany({
        data: membershipsToAdd.map(({ id }) => ({
          retailLocationId: id,
          role: Role.ADMIN,
          userId: currentAdmin.id,
        })),
      });

      this.logger.log("Memberships added successfully");
      return;
    }

    this.logger.log("Creating the new admin...");
    try {
      await this.prisma.user.create({
        data: {
          ...adminData,
          emailVerified: true,
          memberships: {
            create: retailLocations.map(({ id }) => ({
              retailLocationId: id,
              role: Role.ADMIN,
            })),
          },
        },
      });

      this.logger.log("Successfully added the admin user to the database");
    } catch (error) {
      this.logger.error(
        "Something went wrong during the creation of the admin. Try again",
        error,
      );
    }
  }
}
