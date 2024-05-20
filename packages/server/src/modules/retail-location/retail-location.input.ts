import { InputType, IntersectionType, PickType } from "@nestjs/graphql";
import { RetailLocation } from "src/@generated";
import { LocationBoundInput } from "src/modules/retail-location/retail-location.args";

// When put into retail-location.args.ts, it gives a random reflection error for an unknown reason
@InputType()
export class UpdateRetailLocationSettingsInput extends IntersectionType(
  LocationBoundInput,
  PickType(
    RetailLocation,
    [
      "maxBookingDays",
      "payOffEnabled",
      "warehouseMaxBlockSize",
      "buyRate",
      "sellRate",
    ],
    InputType,
  ),
) {}
