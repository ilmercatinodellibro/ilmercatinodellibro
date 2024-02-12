import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ReservationService } from "./rerservation.service";
import { ReservationResolver } from "./reservation.resolver";

@Module({
  imports: [PrismaModule],
  providers: [ReservationResolver, ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
