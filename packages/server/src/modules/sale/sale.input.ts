import { InputType, PickType } from "@nestjs/graphql";
import { Sale } from "src/@generated/graphql";

@InputType()
export class RefundSaleInput extends PickType(Sale, ["id"], InputType) {}
