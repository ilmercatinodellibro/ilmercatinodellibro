import { exec } from "child_process";
import { existsSync, mkdirSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaClient } from "@prisma/client";
import {
  DatabaseConfiguration,
  databaseConfiguration,
} from "src/config/database";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(databaseConfiguration.KEY)
    private readonly databaseConfig: DatabaseConfiguration,
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  dump_database() {
    const currentDate: Date = new Date();
    const year: number = currentDate.getFullYear();
    const month: string = (currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0");
    const day: string = currentDate.getDate().toString().padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;

    const backupDir = `./backup`;

    /*
    we know that /var/lib/postgres/ exists
    we check if backup/ exists. If not, we create it
    */

    if (!existsSync(backupDir)) {
      mkdirSync(backupDir);
    }
    const files = readdirSync(backupDir);

    files.forEach((file) => {
      const match = file.match(/^backup-(\d{4})-(\d{2})-(\d{2})\.sql$/);
      if (match) {
        if (Number(match[1]) <= year - 2) {
          const filePath = join(backupDir, file);
          try {
            unlinkSync(filePath);
          } catch (error) {
            console.error(`Error deleting file ${file}`);
          }
        }
      }
    });

    const filename = `${backupDir}/backup-${formattedDate}.sql`;
    const pgDumpCommand = `PGPASSWORD="${this.databaseConfig.password}" pg_dump -h localhost -U ${this.databaseConfig.user} -d ${this.databaseConfig.name} -p ${this.databaseConfig.port} -f ${filename}`;

    exec(pgDumpCommand, (error, stdout, stderr) => {
      if (error) {
        //console.error(`Error executing pg_dump: ${error.message}`);
        return;
      }
      if (stderr) {
        //console.error(`pg_dump stderr: ${stderr}`);
        return;
      }
      //console.log(`Database dumped successfully to ${filename}`);
    });
  }
}
