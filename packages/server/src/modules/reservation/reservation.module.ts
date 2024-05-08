import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ReservationResolver } from "./reservation.resolver";
import { ReservationService } from "./reservation.service";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ReservationResolver, ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
