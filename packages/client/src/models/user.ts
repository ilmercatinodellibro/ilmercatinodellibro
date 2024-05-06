import { UpdateUserPayload } from "src/@generated/graphql";

export type UserData = Omit<
  UpdateUserPayload,
  "__typename" | "id" | "retailLocationId" | "date" | "discount" | "notes"
> & { date: number; confirmEmail: string; delegate: string };
