import { exec } from "child_process";
import { readdirSync, unlinkSync } from "fs";
import { join } from "path";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
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

    const backupDir = ``;
    const files = readdirSync(backupDir); //TODO: change dir

    files.forEach((file) => {
      const match = file.match(/^backup-(\d{4})-(\d{2})-(\d{2})\.sql$/);
      if (match) {
        if (Number(match[1]) <= year - 2) {
          const filePath = join(backupDir, file); //TODO: change dir
          try {
            unlinkSync(filePath);
          } catch (error) {
            console.error(`Error deleting file ${file}`);
          }
        }
      }
    });

    const filename = `${backupDir}/backup-${formattedDate}.sql`;
    const pgDumpCommand = `pg_dump -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f ${filename}`;

    exec(pgDumpCommand);
  }
}
