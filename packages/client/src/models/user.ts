import { UpdateUserPayload } from "src/@generated/graphql";

export type UserData = Omit<
  UpdateUserPayload,
  "__typename" | "id" | "retailLocationId" | "discount" | "notes"
> & { email: string; confirmEmail: string };

export enum AvailableManageUserFilterOptions {
  WithAvailable = "withAvailable",
  WithRequested = "withRequested",
  WithPurchased = "withPurchased",
  WithSold = "withSold",
}
