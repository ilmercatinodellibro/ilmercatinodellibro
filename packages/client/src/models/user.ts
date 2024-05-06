import { UpdateUserPayload } from "src/@generated/graphql";

export type UserData = Omit<
  UpdateUserPayload,
  "__typename" | "id" | "retailLocationId" | "discount" | "notes"
> & { confirmEmail: string };
