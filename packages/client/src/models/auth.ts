import { UserFragment } from "src/services/user.graphql";

export type UserInfo = Omit<
  UserFragment,
  "discount" | "notes" | "__typename" | "role" | "id"
>;
