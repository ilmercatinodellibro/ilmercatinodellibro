import { UpdateUserPayload } from "src/@generated/graphql";

export type UserData = Omit<
  UpdateUserPayload,
  "__typename" | "id" | "retailLocationId" | "discount" | "notes"
> & { email: string; confirmEmail: string };

export enum AvailableManageUserFilterOptions {
  Email = "email",
  FirstName = "firstName",
  LastName = "lastName",
  PhoneNumber = "phoneNumber",
  InStock = "inStock",
  Sold = "sold",
  Requested = "requested",
  Purchased = "purchased",
  CreationDate = "creationDate",
  Receipts = "receipts",
  Reserved = "reserved",
  Cart = "cart",
}
