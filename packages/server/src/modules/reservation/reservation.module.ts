import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { ReservationResolver } from "./reservation.resolver.js";
import { ReservationService } from "./reservation.service.js";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ReservationResolver, ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
