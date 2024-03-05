import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ReservationResolver } from "./reservation.resolver";
import { ReservationService } from "./reservation.service";

@Module({
  imports: [PrismaModule],
  providers: [ReservationResolver, ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
